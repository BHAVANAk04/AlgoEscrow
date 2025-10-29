# contract.py (Freelancer Escrow dApp)

from algopy import (
    Asset,
    Global,
    Txn,
    UInt64,
    arc4,
    gtxn,
    itxn,
    Account,  # ADDED: Imported Account to satisfy inner transaction type hints
)

class DigitalMarketplace(arc4.ARC4Contract):
    # --- Global State Variables for Escrow Contract ---
    client_addr: arc4.Address       # The public address of the client (Boss)
    freelancer_addr: arc4.Address   # The public address of the freelancer (Worker)
    escrow_amount: UInt64           # The exact amount of ALGO or ASA tokens to be held in escrow
    asset_id: UInt64                # ASA_ID: The ID of the asset being held (0 for Algo)
    status: UInt64                  # O=PENDING, 1=FUNDED, 2=COMPLETED, 3=CANCELED

    # --- Original Template Variable (Kept for compatibility) ---
    unitary_price: UInt64

    # 1. create_application (Repurposed for create_escrow)
    @arc4.abimethod(
        allow_actions=["NoOp"],
        create="require",
    )
    def create_application(
        self,
        freelancer_address: arc4.Address,
        escrow_amount: UInt64,
        asset_id: UInt64,
        unitary_price: UInt64, # Kept for compatibility but logically unused
    ) -> None:
        """Initializes the escrow contract with Client/Freelancer/Amount/Status."""
        # Pre-Condition: Sender != FREELANCER (arc4.Address object passed as argument is compared directly)
        assert Txn.sender != freelancer_address

        # Core Action: Set initial parameters and STATUS to PENDING (0)
        self.client_addr = arc4.Address(Txn.sender)
        self.freelancer_addr = freelancer_address
        self.escrow_amount = escrow_amount
        self.asset_id = asset_id
        self.status = UInt64(0)
        self.unitary_price = unitary_price

    # 2. set_price (Kept for template structure but logically unused in escrow)
    @arc4.abimethod()
    def set_price(self, unitary_price: UInt64) -> None:
        """Updates unitary_price (Kept for template compatibility)."""
        assert Txn.sender == Global.creator_address
        self.unitary_price = unitary_price

    # 3. opt_in_to_asset (Repurposed for fund_escrow)
    @arc4.abimethod()
    def opt_in_to_asset(
        self,
        mbr_pay: gtxn.PaymentTransaction, # This is the funding transaction (Txn 0)
    ) -> None:
        """Client funds the escrow contract and sets status to FUNDED (1)."""
        # Pre-Condition 1: Status must be PENDING (0)
        assert self.status == UInt64(0)
        # Pre-Condition 2: Sender must be CLIENT (arc4.Address state variable used directly)
        assert Txn.sender == self.client_addr

        # Pre-Condition 3: Atomic Checks (Txn 0 = Payment/Asset Transfer)
        assert mbr_pay.sender == self.client_addr
        assert mbr_pay.receiver == Global.current_application_address

        # Pre-Condition 4: Check Amount (Simplified to ALGO only, ASA_ID=0)
        assert self.asset_id == UInt64(0)
        # Client must send escrow_amount + fee buffer for future inner transactions
        assert mbr_pay.amount >= self.escrow_amount + Global.min_txn_fee

        # Core Action: Validates and accepts the funds
        self.status = UInt64(1) # Sets STATUS to FUNDED (1)

        # Inner Transaction: Contract opts into asset (ONLY required if asset_id > 0)
        # For ALGO (asset_id == 0), no opt-in is needed
        if self.asset_id > UInt64(0):
            itxn.AssetTransfer(
                xfer_asset=self.asset_id,
                asset_receiver=Global.current_application_address,
                asset_amount=UInt64(0),
                fee=Global.min_txn_fee,
            ).submit()

    # 4. buy (Repurposed for approve_work)
    @arc4.abimethod()
    def buy(
        self,
        buyer_txn: gtxn.PaymentTransaction, # Unused, kept for compatibility
        quantity: UInt64,                   # Unused, kept for compatibility
    ) -> None:
        """Client approves work, releasing the escrow funds to the Freelancer."""
        # Pre-Condition 1: Sender must be CLIENT
        assert Txn.sender == self.client_addr
        # Pre-Condition 2: Status must be FUNDED (1)
        assert self.status == UInt64(1)

        # Core Action: Transfer FULL escrow amount to freelancer
        # Fee is paid from the extra buffer funds the client sent
        itxn.Payment(
            receiver=Account(self.freelancer_addr.bytes), 
            amount=self.escrow_amount,  # Send FULL amount to freelancer
            fee=Global.min_txn_fee,
        ).submit()

        self.status = UInt64(2)  # Sets STATUS to COMPLETED (2)

    # 5. New Method: cancel_job (Implements cancel_escrow/Refund)
    @arc4.abimethod()
    def cancel_job(self) -> None:
        """Client cancels the job, refunding the funds back to the Client."""
        # Pre-Condition 1: Sender must be CLIENT
        assert Txn.sender == self.client_addr
        # Pre-Condition 2: Status must be FUNDED (1)
        assert self.status == UInt64(1)

        # Core Action: Refund escrow amount to client
        # Send back escrow_amount only, keep the fee buffer for this transaction
        itxn.Payment(
            receiver=Account(self.client_addr.bytes), 
            amount=self.escrow_amount,  # Refund FULL escrow amount
            fee=Global.min_txn_fee,
        ).submit()

        self.status = UInt64(3)  # Sets STATUS to CANCELED (3)

    # 6. delete_application (Repurposed for final delete_app)
    @arc4.abimethod(allow_actions=["DeleteApplication"])
    def delete_application(self) -> None:
        """Deletes the application, reclaiming the min balance reserve."""
        # Pre-Condition 1: Caller must be CLIENT
        assert Txn.sender == self.client_addr
        # Pre-Condition 2: Only callable if STATUS is COMPLETED (2) or CANCELED (3)
        assert (self.status == UInt64(2)) or (self.status == UInt64(3))

        # Core Action: Close the contract account and send ALL remaining balance to client
        # This includes the MBR and any leftover fee buffer
        # Use Global.min_txn_fee and ensure contract has enough balance
        itxn.Payment(
            receiver=Account(self.client_addr.bytes), 
            amount=UInt64(0),
            close_remainder_to=Account(self.client_addr.bytes),
            fee=Global.min_txn_fee,  # Contract must have 1000 microALGO for this fee
        ).submit()
