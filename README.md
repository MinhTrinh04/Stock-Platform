# FinanceView - Nền tảng Theo dõi Thị trường Tài chính
<img width="1687" height="888" alt="crypto_wl" src="https://github.com/user-attachments/assets/8379a4c0-77c4-44d1-b174-7dda858dd1f4" />

FinanceView là một nền tảng toàn diện cho phép người dùng theo dõi và phân tích thị trường tài chính, bao gồm chứng khoán, ngoại hối (forex), và tiền điện tử (crypto). Dự án được xây dựng với kiến trúc microservices cho backend và giao diện người dùng hiện đại, đáp ứng nhanh bằng React cho frontend.

## Tính năng chính

* **Đa thị trường:** Cung cấp dữ liệu và biểu đồ cho ba loại thị trường chính:
    * **Chứng khoán:** Theo dõi cổ phiếu, xem thông tin công ty và phân tích biểu đồ giá.
    * **Ngoại hối (Forex):** Theo dõi tỷ giá các cặp tiền tệ.
    * **Tiền điện tử (Crypto):** Theo dõi giá và thông tin các loại tiền điện tử phổ biến.
* **Xác thực và Phân quyền người dùng:**
    * Đăng ký và đăng nhập an toàn sử dụng JWT (JSON Web Tokens).
    * Quản lý thông tin cá nhân của người dùng.
* **Danh sách theo dõi (Watchlist) cá nhân hóa:**
    * Người dùng có thể thêm, xóa, và sắp xếp các mã chứng khoán, cặp tiền tệ, hoặc tiền điện tử yêu thích vào danh sách theo dõi của riêng mình.
* **Biểu đồ tương tác nâng cao:**
    * Hiển thị dữ liệu giá lịch sử (OHLCV) dưới dạng biểu đồ đường (line) và biểu đồ nến (candlestick).
    * Tích hợp các chỉ báo kỹ thuật phổ biến như EMA, RSI, và Bollinger Bands.
    * Cung cấp các công cụ vẽ và phân tích kỹ thuật trực tiếp trên biểu đồ (Trend Line, Fibonacci Retracement, Rectangle, v.v.).
* **Giao diện hiện đại và đáp ứng:**
    * Xây dựng bằng Next.js và các component từ `shadcn/ui`, đảm bảo trải nghiệm mượt mà trên cả máy tính và thiết bị di động.
    * Chế độ Sáng/Tối (Light/Dark mode).

## Kiến trúc hệ thống

Dự án được xây dựng theo kiến trúc microservices, bao gồm:

* **Frontend:** Một ứng dụng Next.js (React) cung cấp giao diện người dùng.
* **Backend:** Gồm 3 services chính, mỗi service chạy trong một Docker container riêng biệt:
    * **User Service:** Quản lý người dùng, xác thực, và watchlist.
    * **Market Data Service:** Cung cấp dữ liệu thị trường (giá, thông tin công ty/crypto/forex) từ các nguồn bên ngoài (ví dụ: `vnstock`) và lưu trữ vào MongoDB. Service này cũng sử dụng Python để lấy dữ liệu.
    * **Chart Service:** Cung cấp các tính toán về chỉ báo kỹ thuật (RSI, EMA, Bollinger Bands).
* **Cơ sở dữ liệu:**
    * **MongoDB:** Cơ sở dữ liệu chính để lưu trữ thông tin người dùng, dữ liệu thị trường, v.v.
    * **Redis:** Được sử dụng để caching, tăng tốc độ truy vấn dữ liệu.

## Công nghệ sử dụng

### Frontend

* **Framework:** Next.js
* **Ngôn ngữ:** TypeScript
* **Thư viện UI:** React, Tailwind CSS
* **Biểu đồ:** ApexCharts, Recharts
* **Quản lý state:** React Hooks (useState, useEffect)

### Backend

* **Nền tảng:** Node.js, Express.js
* **Cơ sở dữ liệu:** MongoDB (với Mongoose), Redis (với ioredis)
* **Xác thực:** JWT (jsonwebtoken), bcryptjs
* **Lấy dữ liệu:** Python (`vnstock`, `pandas`)
* **Phân tích kỹ thuật:** `technicalindicators`

### DevOps

* **Containerization:** Docker, Docker Compose

## Hướng dẫn cài đặt và chạy dự án

### Yêu cầu

* Docker và Docker Compose
* Node.js và npm (hoặc yarn)

### Các bước cài đặt

1.  **Clone repository:**

    ```bash
    git clone [https://github.com/minhtrinh04/stock-platform.git](https://github.com/minhtrinh04/stock-platform.git)
    cd stock-platform
    ```

2.  **Cấu hình biến môi trường cho Backend:**
    Tạo một file `.env` trong thư mục `Backend` và sao chép nội dung từ file `.env.example` (nếu có) hoặc sử dụng nội dung sau, thay đổi các giá trị cho phù hợp:

    ```env
    MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/FinanceView?retryWrites=true&w=majority
    JWT_SECRET=YOUR_JWT_SECRET
    REDIS_URL=redis://redis:6379
    ```
    *Lưu ý: `REDIS_URL` sử dụng `redis` làm hostname vì các services đang giao tiếp với nhau trong cùng một mạng Docker.*

3.  **Chạy Backend services với Docker Compose:**
    Từ thư mục gốc của project, chạy lệnh sau:

    ```bash
    docker-compose up -d --build
    ```
    Lệnh này sẽ build và khởi chạy 4 containers: `user-service`, `market-data-service`, `chart-service`, và `redis`.

4.  **Chạy Frontend:**
    * Di chuyển vào thư mục `Frontend`:
        ```bash
        cd Frontend
        ```
    * Cài đặt các dependencies:
        ```bash
        npm install
        ```
    * Khởi chạy development server:
        ```bash
        npm run dev
        ```

5.  **Truy cập ứng dụng:**
    Mở trình duyệt và truy cập vào `http://localhost:3000` để sử dụng ứng dụng.

    * Frontend chạy trên port `3000`.
    * Backend services sẽ expose các port `3001`, `3002`, `3003` trên máy host của bạn.
