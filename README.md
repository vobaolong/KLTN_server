## Environment Variables

Below are the environment variables used in this project:

| **Variable**                     | **Description**                                    |
|----------------------------------|----------------------------------------------------|
| `DATABASE`                       | MongoDB connection string                          |
| `CLIENT_PORT_1`                  | Port for the first client instance                  |
| `CLIENT_PORT_2`                  | Port for the second client instance                 |
| `CLIENT_PORT_3`                  | Port for the third client instance                  |
| `PORT`                           | Port for the server                                |
| `ACCESS_TOKEN_SECRET`            | Secret key for access tokens                       |
| `REFRESH_TOKEN_SECRET`           | Secret key for refresh tokens                      |
| `JWT_FORGOT_PASSWORD_SECRET`     | Secret key for forgot password JWT                 |
| `JWT_EMAIL_CONFIRM_SECRET`       | Secret key for email confirmation JWT              |
| `ADMIN_EMAIL`                    | Admin email address                                |
| `ADMIN_EMAIL_PASSWORD`           | Password for the admin email                       |
| `VNP_TMN_CODE`                   | VNPAY TMN code                                     |
| `VNP_HASH_SECRET`                | VNPAY hash secret                                  |
| `VNP_URL`                        | VNPAY payment URL                                  |

> **Note**: Replace the example values with the actual environment variable values used in your project. Ensure sensitive information like passwords and secrets are handled securely.
