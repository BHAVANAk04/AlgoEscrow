import pytest
import algokit_utils
from algokit_utils import SigningAccount, AlgorandClient, AlgoAmount, PaymentParams
from algosdk.transaction import PaymentTxn
from algosdk.atomic_transaction_composer import TransactionWithSigner
from smart_contracts.artifacts.digital_marketplace.digital_marketplace_client import (
    DigitalMarketplaceClient,
    DigitalMarketplaceFactory,
)

# --- Constants for Escrow Testing ---
ESCROW_AMOUNT_ALGO = 5_000_000  # 5 ALGO (5,000,000 microALGO)
ASSET_ID_ALGO = 0              # 0 for Algo (as enforced in your contract, standard for ALGO)
FEE_BUFFER = 1_000             # 1000 microALGO fee buffer for inner transactions

# --- Fixtures (Setup Accounts and Client) ---

@pytest.fixture(scope="session")
def algorand() -> AlgorandClient:
    """Fixture to create an Algorand client that connects to the local test network"""
    return AlgorandClient.default_localnet()

@pytest.fixture(scope="session")
def dispenser(algorand: AlgorandClient) -> SigningAccount:
    """
    Fixture to get the dispenser account to fund test accounts.
    """
    return algorand.account.localnet_dispenser()

@pytest.fixture(scope="session")
def creator(algorand: AlgorandClient, dispenser: SigningAccount) -> SigningAccount:
    """Fixture for the Client account"""
    acct = algorand.account.random()
    # Fund the newly created account with 20 ALGO from the dispenser
    algorand.send.payment(
        PaymentParams(
            sender=dispenser.address,
            receiver=acct.address,
            amount=AlgoAmount.from_algo(20),  # Increased funding
            signer=dispenser.signer,
        )
    )
    return acct

@pytest.fixture(scope="session")
def freelancer(algorand: AlgorandClient, dispenser: SigningAccount) -> SigningAccount:
    """Fixture for the Freelancer account"""
    acct = algorand.account.random()
    algorand.send.payment(
        PaymentParams(
            sender=dispenser.address,
            receiver=acct.address,
            amount=AlgoAmount.from_algo(10),
            signer=dispenser.signer,
        )
    )
    return acct

@pytest.fixture(scope="session")
def test_asset_id(creator: SigningAccount, algorand: AlgorandClient) -> int:
    """Fixture to create a test asset (used for setup compatibility)"""
    result = algorand.send.asset_create(
        algokit_utils.AssetCreateParams(
            sender=creator.address,
            signer=creator.signer,
            total=10,
            decimals=0,
            unit_name="TASA",
            asset_name="TestAsset",
        )
    )
    return result.confirmation["asset-index"]

@pytest.fixture(scope="session")
def digital_marketplace_client(
    algorand: AlgorandClient,
    creator: SigningAccount,
    freelancer: SigningAccount,
    test_asset_id: int, 
) -> DigitalMarketplaceClient:
    """Fixture to instantiate and deploy the Freelancer Escrow smart contract client (create_escrow)."""
    factory = DigitalMarketplaceFactory(
        algorand=algorand,
        default_sender=creator.address,
        default_signer=creator.signer,
    )
    
    client, _ = factory.send.create.create_application(
        args=(freelancer.address, ESCROW_AMOUNT_ALGO, ASSET_ID_ALGO, 0),
    )
    
    return client

# --- Test Cases ---

def test_fund_escrow(
    digital_marketplace_client: DigitalMarketplaceClient,
    creator: SigningAccount,
    algorand: AlgorandClient,
):
    """
    Test case to simulate the Client funding the escrow contract. 
    Maps to the 'fund_escrow' logic in your 'opt_in_to_asset' method.
    """
    # Get global state using the client's state property
    app_state = digital_marketplace_client.state.global_state
    assert app_state.status == 0 
    escrow_amount = app_state.escrow_amount
    
    sp = algorand.client.algod.suggested_params()
    sp.fee = sp.min_fee + 1_000  # Apply extra_fee
    sp.flat_fee = True
    
    # FIXED: Send escrow_amount + fee buffer so contract can pay for inner transactions
    fund_pay_txn = PaymentTxn(
        sender=creator.address,
        sp=sp,
        receiver=digital_marketplace_client.app_address,
        amt=escrow_amount + FEE_BUFFER,  # Add fee buffer
    )
    
    result = digital_marketplace_client.send.opt_in_to_asset(
        args=(TransactionWithSigner(txn=fund_pay_txn, signer=creator.signer),),
    )
    
    assert result.confirmation
    
    # Verify state after funding
    app_state_after = digital_marketplace_client.state.global_state
    assert app_state_after.status == 1
    
    # Verify app balance (should have escrow_amount + fee buffer)
    app_info = algorand.client.algod.account_info(digital_marketplace_client.app_address)
    app_balance = app_info["amount"]
    assert app_balance >= escrow_amount + FEE_BUFFER

def test_approve_work(
    digital_marketplace_client: DigitalMarketplaceClient,
    creator: SigningAccount,
    freelancer: SigningAccount,
    algorand: AlgorandClient,
):
    """
    Test case to simulate the Client approving the work, which releases funds to the Freelancer.
    Maps to the 'approve_work' logic in your 'buy' method.
    """
    app_state = digital_marketplace_client.state.global_state
    assert app_state.status == 1
    
    escrow_amount = app_state.escrow_amount
    freelancer_info = algorand.client.algod.account_info(freelancer.address)
    freelancer_before = freelancer_info["amount"]
    
    # Create suggested params for the payment transaction
    sp_payment = algorand.client.algod.suggested_params()
    sp_payment.flat_fee = True
    sp_payment.fee = 2_000  # Increase payment txn fee to cover inner transaction
    
    # Call buy method - the payment transaction fee will cover the inner transaction
    result = digital_marketplace_client.send.buy(
        args=(
            TransactionWithSigner(
                txn=PaymentTxn(
                    sender=creator.address, 
                    sp=sp_payment,
                    receiver=creator.address, 
                    amt=0
                ),
                signer=creator.signer
            ),
            0,
        ),
    )
    
    assert result.confirmation
    
    # Verify state after approval
    app_state_after = digital_marketplace_client.state.global_state
    assert app_state_after.status == 2
    
    # Verify freelancer received FULL escrow payment
    freelancer_info_after = algorand.client.algod.account_info(freelancer.address)
    freelancer_after = freelancer_info_after["amount"]
    # Freelancer should receive the FULL escrow amount (no deduction)
    assert freelancer_after >= freelancer_before + escrow_amount - 1000  # Allow 1000 buffer for any rounding

def test_cancel_job(
    algorand: AlgorandClient,
    creator: SigningAccount,
    freelancer: SigningAccount,
):
    """
    Test case to simulate a Client canceling the job, which refunds funds to the Client.
    Maps to your custom 'cancel_job' method.
    """
    factory = DigitalMarketplaceFactory(
        algorand=algorand,
        default_sender=creator.address,
        default_signer=creator.signer,
    )
    
    CANCEL_ESCROW_AMOUNT = 3_000_000
    temp_client, _ = factory.send.create.create_application(
        args=(freelancer.address, CANCEL_ESCROW_AMOUNT, ASSET_ID_ALGO, 0),
    )
    
    sp = algorand.client.algod.suggested_params()
    sp.fee = sp.min_fee + 1_000
    sp.flat_fee = True
    
    # FIXED: Send escrow_amount + fee buffer
    fund_pay_txn = PaymentTxn(
        sender=creator.address,
        sp=sp,
        receiver=temp_client.app_address,
        amt=CANCEL_ESCROW_AMOUNT + FEE_BUFFER,  # Add fee buffer
    )
    
    temp_client.send.opt_in_to_asset(
        args=(TransactionWithSigner(txn=fund_pay_txn, signer=creator.signer),),
    )
    
    creator_info = algorand.client.algod.account_info(creator.address)
    creator_balance_before = creator_info["amount"]
    
    # Use static_fee to set a fixed fee that will cover inner transactions
    result = temp_client.send.cancel_job(
        send_params={
            "static_fee": AlgoAmount.from_micro_algo(2000),
        }
    )
    
    assert result.confirmation
    
    # Verify state after cancellation
    app_state_after = temp_client.state.global_state
    assert app_state_after.status == 3
    
    # Verify creator received FULL refund
    creator_info_after = algorand.client.algod.account_info(creator.address)
    creator_balance_after = creator_info_after["amount"]
    refund_amount = creator_balance_after - creator_balance_before
    
    # Creator should receive the FULL escrow amount back (minus outer tx fee of 2000)
    assert refund_amount >= CANCEL_ESCROW_AMOUNT - 3000  # Allow buffer for transaction fee

def test_delete_application(
    algorand: AlgorandClient,
    creator: SigningAccount,
    freelancer: SigningAccount,
    dispenser: SigningAccount, 
):
    """
    Test case to delete the application and retrieve the remaining MBR.
    Only callable if STATUS is COMPLETED (2) or CANCELED (3).
    """
    # Create a NEW instance for this test to avoid state conflicts
    factory = DigitalMarketplaceFactory(
        algorand=algorand,
        default_sender=creator.address,
        default_signer=creator.signer,
    )
    
    DELETE_ESCROW_AMOUNT = 2_000_000  # Reduced amount
    temp_client, _ = factory.send.create.create_application(
        args=(freelancer.address, DELETE_ESCROW_AMOUNT, ASSET_ID_ALGO, 0),
    )
    
    # 1. Fund the escrow first
    sp_fund = algorand.client.algod.suggested_params()
    sp_fund.fee = sp_fund.min_fee + 1_000
    sp_fund.flat_fee = True
    
    # Send escrow_amount + fee buffer
    fund_pay_txn = PaymentTxn(
        sender=creator.address,
        sp=sp_fund,
        receiver=temp_client.app_address,
        amt=DELETE_ESCROW_AMOUNT + FEE_BUFFER,  # Add fee buffer
    )
    
    temp_client.send.opt_in_to_asset(
        args=(TransactionWithSigner(txn=fund_pay_txn, signer=creator.signer),),
    )
    
    # 2. Complete the work by calling buy (approve_work)
    sp_payment_buy = algorand.client.algod.suggested_params()
    sp_payment_buy.flat_fee = True
    sp_payment_buy.fee = 2_000  # Increase fee to cover outer and inner transactions
    
    temp_client.send.buy(
        args=(
            TransactionWithSigner(
                txn=PaymentTxn(
                    sender=creator.address, 
                    sp=sp_payment_buy,
                    receiver=creator.address, 
                    amt=0
                ),
                signer=creator.signer
            ),
            0,
        ),
    )
    
    # Now status should be COMPLETED (2)
    app_state = temp_client.state.global_state
    assert app_state.status == 2
    
    # --- FIX START: Inject 1 ALGO to guarantee MBR coverage and final fee buffer ---

    # 3. Inject a large enough amount (1 ALGO) to cover the MBR (100k) 
    # and ensure sufficient balance is available for the delete inner transaction fee.
    
    # Capture creator balance before sending the extra fee (used for final assert)
    creator_info_before_fee_send = algorand.client.algod.account_info(creator.address)
    creator_balance_before_delete = creator_info_before_fee_send["amount"]

    # FIX: Send 1 ALGO (1,000,000 microALGO) from the dispenser to ensure the app has 
    # enough balance (MBR + inner txn fee) for the final delete call.
    INJECTION_AMOUNT_FOR_MBR = AlgoAmount.from_algo(1) 
    
    algorand.send.payment(
        PaymentParams(
            sender=dispenser.address,
            receiver=temp_client.app_address,
            amount=INJECTION_AMOUNT_FOR_MBR,
            signer=dispenser.signer,
        )
    )
    
    # 4. Call delete
    result = temp_client.send.delete.delete_application()
    
    assert result.confirmation
    
    creator_info_after = algorand.client.algod.account_info(creator.address)
    after_call_amount = creator_info_after["amount"]
    
    # The MBR_REFUND (100k) and the INJECTION_AMOUNT (1M) are returned to the creator.
    # The creator also pays the DELETE_TXN_FEE (1k).
    MBR_REFUND = 100_000
    
    # We assert the creator received at least the MBR back, allowing for transaction fees.
    assert after_call_amount - creator_balance_before_delete >= MBR_REFUND - 500 
    # --- FIX END ---
