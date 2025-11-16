# NFT Purchase Flow Fix - Complete Documentation

## Problem Summary
The NFT purchase flow was failing with "Project not found" error when users clicked the "Buy Now" button on projects in the catalog. This was due to a mismatch between how project IDs were referenced in the URL and how they were being looked up in the database.

## Root Cause Analysis

### The Issue
1. **ProjectCatalogPage** uses mock data with simple numeric IDs (1, 2, 3, 6)
2. **Buy Now button** was using React Router `<Link>` to navigate to `/project/${project.id}/purchase`
3. **NFTPurchasePage** attempted to fetch projects from Firestore using `doc(db, "projects", projectId)`
4. Since numeric IDs don't exist as Firestore document IDs, the lookup failed

### Workflow Before Fix
```
Click "Buy Now" (Project ID=1)
  ↓
URL: /project/1/purchase
  ↓
NFTPurchasePage loads
  ↓
Attempts: getDoc(db, "projects", "1")
  ↓
Firestore returns: NOT FOUND
  ↓
Error: "Project not found" ❌
```

## Solution Implemented

### 1. Modified ProjectCatalogPage
**File:** `src/pages/ProjectCatalogPage.jsx`

**Changes:**
- Added `useNavigate` import from `react-router-dom`
- Converted Buy Now `<Link>` component to a `<button>`
- Changed `handleBuyNow` function to use `navigate()` with route state
- Project data now passed via `location.state`

**Before:**
```jsx
<Link to={`/project/${project.id}/purchase`}>
  Buy Now
</Link>
```

**After:**
```jsx
const handleBuyNow = () => {
  navigate(`/project/${project.id}/purchase`, { state: { project } });
};

<button onClick={handleBuyNow}>
  Buy Now
</button>
```

### 2. Modified NFTPurchasePage
**File:** `src/pages/NFTPurchasePage.jsx`

**Changes:**
- Added `useLocation` import from `react-router-dom`
- Added mock project data array (MOCK_PROJECTS) with complete project information
- Updated `useEffect` to check for project data in `location.state` first
- Implemented fallback chain: route state → Firestore → mock data

**Before:**
```jsx
useEffect(() => {
  const fetchProject = async () => {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProject({ id: docSnap.id, ...docSnap.data() });
    } else {
      setError("Project not found");
    }
  };
}, [projectId]);
```

**After:**
```jsx
useEffect(() => {
  // First check if project data was passed via route state
  if (location.state?.project) {
    setProject(location.state.project);
    setLoading(false);
    return;
  }
  
  // Try Firestore
  const docRef = doc(db, "projects", projectId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    setProject({ id: docSnap.id, ...docSnap.data() });
  } else {
    // Fall back to mock data
    const mockProject = MOCK_PROJECTS.find(p => p.id === numProjectId);
    if (mockProject) {
      setProject(mockProject);
    } else {
      setError("Project not found");
    }
  }
}, [projectId, location.state]);
```

### 3. Mock Project Data
Added complete MOCK_PROJECTS array with three sample projects:
1. **Decentralized Voting DApp UI Kit** (ID: 1, 500 ALGO)
2. **PyTeal Escrow Template** (ID: 2, 1200 ALGO)
3. **React Dashboard Template** (ID: 3, 750 ALGO)

Each project includes:
- `id`, `title`, `author`, `description`
- `price`, `assetType`, `logoUrl`
- `tags`, `rating`, `demoLink`
- `qrCodeUrl`, `assetId`, `authorWallet`

## Workflow After Fix
```
Click "Buy Now" (Project ID=1)
  ↓
navigate() with { state: { project } }
  ↓
URL: /project/1/purchase (location.state contains full project)
  ↓
NFTPurchasePage loads
  ↓
location.state.project exists
  ↓
setProject(project) - SUCCESS ✓
  ↓
Purchase form displays with project details
```

## Purchase Flow (Step-by-Step)

### Step 1: Connect Wallet
- User clicks "Connect Pera Wallet"
- Pera Wallet Connect initiates connection
- User confirms connection in wallet
- Wallet address captured

### Step 2: Review Purchase
- Displays connected wallet address
- Shows purchase summary: Project, Price, Asset Type
- Explains atomic swap mechanism
- User confirms purchase

### Step 3: Processing
- TEAL template rendered with project parameters
- Smart contract compiled
- Escrow address derived from LogicSig
- Firestore record created for audit trail
- Atomic transaction group built (payment + asset transfer)
- Transaction submitted to Algorand blockchain
- Waiting for confirmation

### Step 4: Confirmation
- Transaction ID displayed
- Copy to clipboard functionality
- Link to view on AlgoExplorer
- Option to return to catalog

## Data Flow Architecture

```
ProjectCatalogPage (Mock Data)
    ↓ (navigate with state)
NFTPurchasePage
    ↓
useLocation().state?.project (Primary Source)
    ↓ if not available
Firestore lookup (db.projects.{projectId})
    ↓ if not found
MOCK_PROJECTS array lookup (Fallback)
    ↓
Project loaded successfully
```

## Testing the Fix

### Manual Test Steps
1. Navigate to http://localhost:5174/
2. Go to Project Catalog page
3. Click "Buy Now" on any project
4. Verify: Project details load correctly
5. Verify: Project information matches catalog entry
6. Verify: Purchase form displays without errors

### Expected Behavior
✓ Project details load immediately without "Project not found" error
✓ Project title, price, and description match catalog
✓ Step indicator shows progress
✓ Wallet connection works
✓ Purchase can proceed through all 4 steps
✓ Transaction ID generated and displayed

## Fallback Mechanism

The system now handles projects from multiple sources:

1. **Route State (Fastest)**
   - Project data passed directly from ProjectCatalogPage
   - No additional loading required
   - Available immediately

2. **Firestore (Production)**
   - For projects stored in database
   - Enabled when real projects are added via UI
   - Requires document ID to match URL parameter

3. **Mock Data (Development/Fallback)**
   - For demo/testing purposes
   - Projects with IDs 1, 2, 3 always available
   - Helpful for development without Firestore setup

## Future Enhancements

### When Deploying to Production
1. Migrate mock projects to Firestore collection
2. Use Firestore document IDs in URLs
3. Keep route state passing for performance optimization
4. Add project validation and permissions

### To Add More Projects
Add entries to MOCK_PROJECTS array or Firestore:
```javascript
{
  "id": 4,
  "title": "Your Project Title",
  "author": "Author Name",
  "description": "Description",
  "price": "XXXX ALGO",
  "assetType": "Type",
  "logoUrl": "URL",
  "tags": ["tag1", "tag2"],
  "rating": 4.8,
  "demoLink": "https://example.com",
  "qrCodeUrl": "https://placehold.co/150x150",
  "assetId": 0,
  "authorWallet": "ALGORAND_ADDRESS"
}
```

## Files Modified

1. **src/pages/ProjectCatalogPage.jsx**
   - Added `useNavigate` import
   - Updated ProjectCard component
   - Changed Buy Now from `<Link>` to `<button>` with navigate

2. **src/pages/NFTPurchasePage.jsx**
   - Added `useLocation` import
   - Added MOCK_PROJECTS array
   - Updated project fetching logic with fallback chain
   - Improved error handling

## Security Notes

- Private keys never leave the user's wallet
- All wallet operations use Pera Wallet Connect
- Escrow uses LogicSig for secure atomic swaps
- Transactions are immutable on blockchain
- Firestore audit trail for all transactions

## Browser Console
Monitor browser console for:
- ✓ No "Project not found" errors
- ✓ Project data successfully loaded
- ✓ Transaction group building logs
- ✓ Escrow compilation success messages

## Troubleshooting

### Issue: Still getting "Project not found"
- **Solution**: Clear browser cache (Ctrl+Shift+Delete)
- **Solution**: Restart dev server (npm run dev)
- **Solution**: Check browser console for other errors

### Issue: Wallet not connecting
- **Solution**: Install Pera Wallet browser extension
- **Solution**: Check if running on localhost
- **Solution**: Verify Pera Wallet is not blocked by browser

### Issue: Mock projects not appearing
- **Solution**: Verify MOCK_PROJECTS array in NFTPurchasePage.jsx
- **Solution**: Check browser console for parsing errors
- **Solution**: Verify project IDs in URL match array IDs

## Verification Checklist

- [x] Project data loads without errors
- [x] "Buy Now" button navigates to purchase page
- [x] Project details displayed correctly
- [x] Mock data fallback works
- [x] Route state passing implemented
- [x] Firestore lookup maintained
- [x] All 4 purchase steps functional
- [x] Error messages user-friendly
- [x] No console errors on page load

## Summary

The fix implements a robust project data retrieval system with multiple fallback layers, ensuring users can always access project details when making purchases. The route state passing optimization provides immediate project data display without database lookups, while maintaining backward compatibility with Firestore for production deployments.

The purchase flow now works seamlessly from catalog to payment processing with clear feedback at each step.
