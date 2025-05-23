# UmodziRx

## Description
UmodziRx is a web application designed to provide a seamless experience for managing patient prescriptions and healthcare services.

## Installation
To install the project, clone the repository and install the required dependencies using the following commands:

```bash
git clone https://github.com/Bsc-com-ne-23-20/UmodziRx.git
cd UmodziRx/frontEnd
npm install
```

## Usage
To run the application, use the following command:

```bash
npm start
```

This will start the development server and open the application in your default web browser.

## Project Structure (Updated)

The project has been reorganized to follow best practices for React applications:

```
src/
├── components/
│   ├── common/         # Reusable UI components
│   │   ├── LoadingSpinner.js
│   │   ├── StatusIndicator.js
│   │   └── PrescriptionQRScanner.js
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── PharmacistVerifyContent.js
│   │   └── ...
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   │   └── DashboardLayout.js
│   └── charts/         # Chart and data visualization components
├── context/            # React context providers
│   └── AuthContext.js
├── hooks/              # Custom React hooks
│   ├── useDarkMode.js
│   └── useAuth.js
├── pages/              # Page components
│   ├── Dashboard.js    # Unified dashboard page
│   ├── Home.js
│   ├── Login.js
│   └── ...
├── services/           # API services
│   ├── prescriptionService.js
│   ├── patientService.js
│   └── ...
├── styles/             # Global styles
└── utils/              # Utility functions
    └── auth/           # Authentication utilities
```

## Component Organization

### Common Components

Reusable UI components that can be used across the application:

- `LoadingSpinner.js` - A loading spinner component
- `StatusIndicator.js` - A component for displaying status (verified, pending, etc.)
- `PrescriptionQRScanner.js` - A component for scanning QR codes

### Layout Components

Components that define the layout of the application:

- `DashboardLayout.js` - A layout component for dashboard pages

### Dashboard Components

Components specific to dashboard functionality:

- `PharmacistVerifyContent.js` - Content for the pharmacist verification page
- Other dashboard content components

## Custom Hooks

Reusable logic extracted into custom hooks:

- `useDarkMode.js` - Hook for managing dark mode
- `useAuth.js` - Hook for authentication functionality

## Services

API services for interacting with the backend:

- `prescriptionService.js` - Service for prescription-related API calls
- `patientService.js` - Service for patient-related API calls

## Best Practices Implemented

1. **Component Reuse**: Extracted common functionality into reusable components
2. **Custom Hooks**: Extracted reusable logic into custom hooks
3. **API Services**: Centralized API calls in service modules
4. **Consistent Naming**: Used consistent naming conventions
5. **Folder Structure**: Organized code by feature and type
6. **Documentation**: Documented components and functions with JSDoc comments

## License
This project is licensed under the MIT License. The MIT License is a permissive free software license that allows for reuse within proprietary software, as long as the license is included with that software.
