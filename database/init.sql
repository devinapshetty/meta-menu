CREATE DATABASE restaurant_menu;
USE restaurant_menu;

CREATE TABLE customer(
	customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(10) NOT NULL
)AUTO_INCREMENT=1001;

CREATE TABLE menu(
	item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    order_count INT DEFAULT 0,
    real_time_price DECIMAL(10,2)
)AUTO_INCREMENT=1;

CREATE TABLE orderDetails(
	order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    item_id INT,
    order_price DECIMAL(10,2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY(item_id) REFERENCES menu(item_id)
)AUTO_INCREMENT=5001;

CREATE TABLE bill(
	bill_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    bill_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);


DELIMITER //
CREATE TRIGGER set_order_price
BEFORE INSERT ON orderDetails
FOR EACH ROW
BEGIN
	DECLARE current_price DECIMAL(10,2);
    SELECT real_time_price INTO current_price
    FROM menu
    WHERE item_id=NEW.item_id;
    SET NEW.order_price=current_price;
END;
// 
DELIMITER;



DELIMITER //
CREATE TRIGGER increment_order_count
AFTER INSERT ON orderDetails
FOR EACH ROW
BEGIN
    UPDATE Menu
    SET order_count = order_count + 1
    WHERE item_id = NEW.item_id;
END;
//
DELIMITER ;



DELIMITER //
CREATE TRIGGER update_price_after_order
AFTER INSERT ON orderDetails
FOR EACH ROW
BEGIN
    DECLARE total_orders INT;
    SELECT SUM(order_count) INTO total_orders FROM menu;

    UPDATE menu
    SET real_time_price = 
        CASE 
            WHEN total_orders > 0 THEN (order_count / total_orders) * base_price + base_price
            ELSE base_price
        END;
END;
//
DELIMITER ;


DELIMITER //
CREATE TRIGGER generate_bill_entry
AFTER INSERT ON orderDetails
FOR EACH ROW
BEGIN
    INSERT INTO bill(customer_id, amount)
    VALUES (NEW.customer_id,NEW.order_price);
END;
//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetTotalBill(IN cust_id INT,OUT total_amount DECIMAL(10,2))
BEGIN
    SELECT SUM(amount) INTO total_amount
    FROM bill
    WHERE customer_id = cust_id;
END;
//
DELIMITER ;








