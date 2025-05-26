A comprehensive hospital management system built with NestJS, PostgreSQL, and TypeORM. This system provides APIs for managing patients, doctors, appointments, medical records, and hospital operations.

## Features

- **Patient Management**: Registration, profile management, medical history
- **Doctor Management**: Doctor profiles, specializations, schedules
- **Appointment System**: Booking, scheduling, and management
- **Medical Records**: Electronic health records, prescriptions, diagnoses
- **Department Management**: Hospital departments and staff allocation
- **User Authentication**: JWT-based authentication with role-based access control
- **Billing System**: Invoice generation and payment tracking
- **Inventory Management**: Medical supplies and equipment tracking

## Technology Stack

- **Backend Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Environment**: Node.js

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hospital-management-system.git
   cd hospital-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=hospital_management
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Database Setup**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE hospital_management;
   ```

5. **Run Database Migrations**
   ```bash
   npm run migration:run
   # or
   yarn migration:run
   ```

6. **Seed Initial Data (Optional)**
   ```bash
   npm run seed
   # or
   yarn seed
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
# or
yarn start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

### Watch Mode
```bash
npm run start:watch
# or
yarn start:watch
```

The application will be available at `http://localhost:3000`

## Database Schema

### Core Entities

- **Users**: System users (doctors, nurses, admins, patients)
- **Patients**: Patient information and medical history
- **Doctors**: Doctor profiles and specializations
- **Appointments**: Appointment scheduling and management
- **MedicalRecords**: Electronic health records
- **Departments**: Hospital departments
- **Prescriptions**: Medicine prescriptions
- **Billing**: Invoice and payment management
- **Inventory**: Medical supplies and equipment

### Entity Relationships

```
Users (1:1) → Patients
Users (1:1) → Doctors
Doctors (1:n) → Appointments
Patients (1:n) → Appointments
Patients (1:n) → MedicalRecords
Doctors (1:n) → MedicalRecords
Departments (1:n) → Doctors
MedicalRecords (1:n) → Prescriptions
Patients (1:n) → Billing
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

### Main API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token

#### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

#### Doctors
- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID
- `POST /doctors` - Create new doctor
- `PUT /doctors/:id` - Update doctor
- `DELETE /doctors/:id` - Delete doctor

#### Appointments
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get appointment by ID
- `POST /appointments` - Book new appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

#### Medical Records
- `GET /medical-records` - Get all medical records
- `GET /medical-records/patient/:patientId` - Get patient's medical records
- `POST /medical-records` - Create new medical record
- `PUT /medical-records/:id` - Update medical record

## Testing

### Run Tests
```bash
# Unit tests
npm run test
# or
yarn test

# End-to-end tests
npm run test:e2e
# or
yarn test:e2e

# Test coverage
npm run test:cov
# or
yarn test:cov
```

## Scripts

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "migration:generate": "typeorm migration:generate -d src/config/database.config.ts",
  "migration:run": "typeorm migration:run -d src/config/database.config.ts",
  "migration:revert": "typeorm migration:revert -d src/config/database.config.ts",
  "seed": "ts-node src/database/seeds/seed.ts"
}
```

## Project Structure

```
src/
├── auth/                 # Authentication module
├── common/              # Common utilities and decorators
├── config/              # Configuration files
├── database/            # Database configuration and migrations
├── decorators/          # Custom decorators
├── dto/                 # Data Transfer Objects
├── entities/            # TypeORM entities
├── filters/             # Exception filters
├── guards/              # Authentication and authorization guards
├── interceptors/        # Request/response interceptors
├── modules/
│   ├── appointments/    # Appointment management
│   ├── billing/         # Billing and payments
│   ├── departments/     # Department management
│   ├── doctors/         # Doctor management
│   ├── inventory/       # Inventory management
│   ├── medical-records/ # Medical records management
│   ├── patients/        # Patient management
│   └── users/           # User management
├── pipes/               # Validation pipes
├── utils/               # Utility functions
├── app.module.ts        # Root application module
└── main.ts             # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRATION` | JWT token expiration | `24h` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.0.0
- Initial release
- Basic CRUD operations for all entities
- JWT authentication
- Role-based access control
- Swagger documentation
