# UmodziRx Implementation

## Overview
UmodziRx is a comprehensive web application designed to manage patient prescriptions and healthcare services, integrating with MOSIP for identity management and utilizing blockchain technology for secure data handling.

## Live demo
https://umodzirx.tech

## Expanded Tech Stack & Implementation Details

### 1. Frontend Development
**Technologies:**
- **Core:**
  - HTML5: Semantic markup for accessibility (ARIA labels, `<main>`, `<section>`).
  - CSS3: Grid/Flexbox for layouts; CSS Variables for theming.
  - JavaScript (ES6+): Async/await for IPFS/PRE API calls.
- **Framework:** React.js with TypeScript for type safety.
- **State Management:** Redux Toolkit with RTK Query for API caching.
- **UI Library:** Material-UI + Tailwind CSS for utility-first styling.

**MOSIP Integration:**
- MOSIP Web SDK: Embeddable biometric auth components.
- e-Signet React Components: Prebuilt OIDC login flows.
- Blockchain Interaction: Web3.js + Hyperledger Fabric Client SDK.
- Form Handling: React Hook Form with Yup validation.
- Security: CSP Headers (Content Security Policy) via Next.js config.

**HTML Templates:**
- Prescription form with `<input type="date">` for validity, `<datalist>` for drug autocomplete.
- Consent management table (`<table>`) with checkboxes for access grants.

**CSS:**
- Media queries for mobile-responsive prescription cards.
- Print-friendly stylesheets (`@media print`) for physical prescription copies.

**Component Library:**
- Reusable `<MOSIPBioAuth>` component (integrates MOSIP’s biometric modal).
- `<PrescriptionViewer>`: Decrypts/IPFS fetches data via Web3.js.

### 2. Backend Development
**Technologies:**
- **Runtime:** Node.js v18 (LTS) with Express.js or NestJS.
- **Database:** PostgreSQL (patient-MOSIP ID mappings) + CouchDB (blockchain state).

**APIs:**
- **REST:** Prescription metadata, audit logs.
- **GraphQL:** Complex queries (e.g., "Fetch all prescriptions for MOSIP ID X").

**MOSIP Integration:**
- MOSIP Kernel APIs: ID authentication (`/v1/auth/`), credential issuance (`/v1/kyc/`).
- ABHA (Health ID) Service: Link MOSIP IDs to prescriptions.

**Encryption:**
- libsodium (AES-256-GCM for IPFS data).
- Umbral (Proxy Re-Encryption).

**Queueing:** RabbitMQ for async tasks (IPFS uploads, blockchain writes).

**API Endpoints:**
- **POST /prescriptions:**
  - Input: Encrypted file, MOSIP ID, doctor’s license hash.
  - Process: Validate MOSIP ID → Encrypt → IPFS upload → Write to Fabric.
  
- **GET /consent/delegate:**
  - Generates PRE re-encryption key via Umbral; stores in Redis with MOSIP ID TTL.

**Database Schema:**
- **patients:** 
  - `mosip_id_hash` (varchar), `public_key` (text), `created_at` (timestamp).
  
- **access_grants:** 
  - `patient_id` (FK), `pharmacy_id` (FK), `pre_key` (text), `expires_at` (timestamp).

**Middleware:**
- Helmet.js: Secure headers (HSTS, XSS Protection).
- Rate limiting: 100 requests/min per MOSIP ID.

### 3. MOSIP Integration
**Technologies:**
- ID Authentication: `/idauthentication/v1/` (biometric/OTP auth).
- ID Repository: Store hashed health IDs.
- Credential Service: Issue verifiable medical credentials to providers.

### 4. Blockchain Development
**Technologies:**
- Hyperledger Fabric v2.5:
  - Orderer: Raft consensus (crash fault-tolerant).
  - Peers: 3 organizations (hospitals, pharmacies, regulators).
  - Chaincode: Go (for performance) with CouchDB state storage.

### 5. DevOps & Cloud
**Technologies:**
- Infra as Code: Terraform (AWS: EC2, S3, VPC).
- CI/CD: GitHub Actions + ArgoCD (GitOps).
- Monitoring: Prometheus + Grafana.

### 6. Security & Compliance
**Technologies:**
- Private Data Collections: Encrypt patient-pharmacy mappings (AES-256) for Attribution Channel.
- Compliance: Chef Inspec for HIPAA/GDPR audits.

### 7. Testing
**Technologies:**
- Unit Tests: Jest (frontend), Go’s testing package (chaincode).
- E2E: Cypress (frontend), Hyperledger Behave (blockchain).

### 8. Documentation
**Technologies:**
- Swagger/OpenAPI: REST API specs.
- MkDocs: User guides (deployed to GitHub Pages).

## Conclusion
This README provides an overview of the UmodziRx implementation, detailing the technologies and tasks involved in both frontend and backend development, as well as integration with MOSIP and blockchain technologies. For further granularity, please refer to the respective README files in the frontend and backend directories.
