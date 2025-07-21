# Giai đoạn build
FROM node:20-alpine AS build

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json trước để tận dụng Docker cache
COPY yarn*.json ./

# Cài đặt các dependencies
RUN yarn

# Sao chép toàn bộ mã nguồn ứng dụng
COPY . .

# Xây dựng ứng dụng React
RUN yarn run build

# Giai đoạn phục vụ (serve)
FROM nginx:alpine

# Sao chép cấu hình Nginx tùy chỉnh (nếu có)
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các tệp build từ giai đoạn 'build' vào thư mục phục vụ của Nginx
# COPY --from=build /app/build /usr/share/nginx/html

# Mở cổng 3000 để Nginx có thể lắng nghe
EXPOSE 3000

# Khởi động Nginx khi container chạy
CMD ["nginx", "-g", "daemon off;"]
