USE restaurant_menu;

-- Insert sample customers
INSERT INTO customer (customer_name, contact_number) VALUES
('John Doe', '1234567890'),
('Jane Smith', '0987654321'),
('Mike Johnson', '1122334455');


-- Insert sample menu items
INSERT INTO menu (item_name, base_price, real_time_price) VALUES
('Margherita Pizza', 10.00, 10.00),
('Spaghetti Carbonara', 12.00, 12.00),
('Caesar Salad', 8.00, 8.00),
('Tiramisu', 6.00, 6.00),
('Iced Tea', 3.00, 3.00);