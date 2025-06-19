-- CREATING IM PROJECT DATABASE
CREATE DATABASE IF NOT EXISTS pahingalay_db;
USE pahingalay_db;

/*======================================= CREATING TABLE FOR DATABASE ==========================================*/
-- GUEST INFORMATION TABLE
CREATE TABLE guest_information (
	guestID CHAR(10) NOT NULL,
	guestName VARCHAR(60) NOT NULL,
	guestEmail VARCHAR(60) NOT NULL,
	guestContactNo VARCHAR(13) NOT NULL,
	guestSex CHAR(1) NOT NULL,
	guestAge INT NOT NULL,
	nationality VARCHAR(20) NOT NULL,
	address VARCHAR(50) NOT NULL,
    password VARCHAR(100)
);

-- RESERVATION INFORMATION TABLE
CREATE TABLE reservation_information (
	reservationNo CHAR(10) NOT NULL,
	guestID CHAR(10) NOT NULL,
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
	noOfNight INT NOT NULL,
	noOfAdults INT NOT NULL,
	noOfChildren INT NOT NULL,
    roomType VARCHAR(6) NOT NULL,
    bedType VARCHAR(6) NOT NULL,
    smokingPref VARCHAR(11) NOT NULL,
	additionalReq VARCHAR(50) NOT NULL DEFAULT 'NONE',
    totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00
); 

-- COMPANION INFORMATION TABLE
CREATE TABLE companion_information (
	reservationNo CHAR(10) NOT NULL,
    companionID CHAR(15) NOT NULL,
    compName VARCHAR(60) NOT NULL,
	compContactNo VARCHAR(13) NOT NULL,
    compEmail VARCHAR(60) NOT NULL,
    compAge INT NOT NULL,
	compSex CHAR(1) NOT NULL
);

/*==================================== ALTER FOR GUEST INFORMATION TABLE =======================================*/
-- PRIMARY KEY FOR GUEST INFORMATION TABLE
ALTER TABLE guest_information
ADD CONSTRAINT pk_guestInfo PRIMARY KEY (guestID);

-- PRIMARY KEY FORMAT (guestID)
ALTER TABLE guest_information
ADD CONSTRAINT chk_guestInfo_guestID_format
CHECK (guestID REGEXP '^G-[0-9]{8}$');

-- GUEST EMAIL FORMAT (guestEmail)
ALTER TABLE guest_information
ADD CONSTRAINT chk_guestEmail_format
CHECK (guestEmail LIKE '%_@_%._%');

-- ALLOWABLE VALUES FOR GUEST SEX
ALTER TABLE guest_information
ADD CONSTRAINT chk_guestSex
CHECK (UPPER(guestSex) IN ('M', 'F', 'O'));

-- GUEST AGE MUST BE POSITIVE AND LESS THAN OR EQUAL TO 100
ALTER TABLE guest_information
ADD CONSTRAINT chk_guestAge
CHECK (guestAge > 0 AND guestAge <= 100);

/*================================ ALTER FOR RESERVATION INFORMATION TABLE =====================================*/
-- PRIMARY KEY FOR RESERVATION INFORMATION TABLE
ALTER TABLE reservation_information
ADD CONSTRAINT pk_reservationInfo PRIMARY KEY (reservationNo);

-- PRIMARY KEY FORMAT (reservationNo)
ALTER TABLE reservation_information
ADD CONSTRAINT chk_reservationInfo_reservationNo_format
CHECK(reservationNo REGEXP '^R-[A-Za-z0-9]{8}$');

-- FOREIGN KEY RESERVATION-GUEST INFORMATION TABLE
ALTER TABLE reservation_information
ADD CONSTRAINT fk_reservationInfo_guestInfo
FOREIGN KEY (guestID)
REFERENCES guest_information (guestID)
ON DELETE CASCADE;

-- NO OF NIGHT MUST BE POSITIVE AND LESS THAN 100
ALTER TABLE reservation_information
ADD CONSTRAINT chk_noOfNight
CHECK (noOfNight > 0 AND noOfNight < 100);

-- NO OF ADULTS MUST BE ZERO OR MORE AND LESS THAN OR EQUAL TO 6
ALTER TABLE reservation_information
ADD CONSTRAINT chk_noOfAdults
CHECK (noOfAdults >= 0 AND noOfAdults <= 6);

-- NO OF CHILDREN MUST BE ZERO OR MORE AND LESS THAN OR EQUAL TO 6
ALTER TABLE reservation_information
ADD CONSTRAINT chk_noOfChildren
CHECK (noOfChildren >= 0 AND noOfChildren <= 6);

-- ALLOWABLE VALUES FOR ROOM TYPE
ALTER TABLE reservation_information
ADD CONSTRAINT chk_roomType
CHECK (UPPER(roomType) IN ('SINGLE', 'DOUBLE', 'SUITE', 'FAMILY'));

-- ALLOWABLE VALUES FOR BED TYPE
ALTER TABLE reservation_information
ADD CONSTRAINT chk_bedType
CHECK (UPPER(bedType) IN ('KING', 'QUEEN', 'TWIN'));

-- ALLOWABLE VALUES FOR SMOKING PREFERENCE
ALTER TABLE reservation_information
ADD CONSTRAINT chk_smokingPref
CHECK (UPPER(smokingPref) IN ('SMOKING', 'NON-SMOKING'));

/*================================= ALTER FOR COMPANION INFORMATION TABLE ======================================*/
-- PRIMARY KEY FOR COMPANION INFORMATION TABLE
ALTER TABLE companion_information
ADD CONSTRAINT pk_companionInfo PRIMARY KEY (reservationNo, companionID);

-- PRIMARY KEY FORMAT (reservationNo and CompanionID)
ALTER TABLE companion_information
ADD CONSTRAINT chk_companionInfo_reservationNo_format
CHECK(reservationNo REGEXP '^R-[A-Za-z0-9]{8}$');

ALTER TABLE companion_information
ADD CONSTRAINT chk_companionInfo_companionID_format
CHECK (companionID REGEXP '^C-[0-9]{8}-[0-9]{4}$');

-- FOREIGN KEY TO COMPANION-RESERVATION INFORMATION TABLE
ALTER TABLE companion_information
ADD CONSTRAINT fk_companionInfo_reservationInfo
FOREIGN KEY (reservationNo)
REFERENCES reservation_information (reservationNo)
ON DELETE CASCADE;

-- COMPANION EMAIL FORMAT (compEmail)
ALTER TABLE companion_information
ADD CONSTRAINT chk_compEmail_format
CHECK (compEmail LIKE '%_@_%._%');

-- COMPANION AGE MUST BE POSITIVE AND LESS THAN OR EQUAL TO 100
ALTER TABLE companion_information
ADD CONSTRAINT chk_compAge
CHECK (compAge > 0 AND compAge <= 100);

-- ALLOWABLE VALUES FOR COMPANION SEX
ALTER TABLE companion_information
ADD CONSTRAINT chk_compSex
CHECK (UPPER(compSex) IN ('M', 'F', 'O'));

/*============================== TRIGGERS TO ENFORCE UPPERCASE FOR ALLOWABLE VALUES ==============================*/
DELIMITER //

-- Trigger for GUEST INFORMATION TABLE
CREATE TRIGGER before_guest_insert
BEFORE INSERT ON guest_information
FOR EACH ROW
BEGIN
    SET NEW.guestSex = UPPER(NEW.guestSex);
END;
//

CREATE TRIGGER before_guest_update
BEFORE UPDATE ON guest_information
FOR EACH ROW
BEGIN
    SET NEW.guestSex = UPPER(NEW.guestSex);
END;
//

-- Trigger for RESERVATION INFORMATION TABLE
CREATE TRIGGER before_reservation_insert
BEFORE INSERT ON reservation_information
FOR EACH ROW
BEGIN
    SET NEW.roomType = UPPER(NEW.roomType);
    SET NEW.bedType = UPPER(NEW.bedType);
    SET NEW.smokingPref = UPPER(NEW.smokingPref);
    IF TRIM(LOWER(NEW.additionalReq)) = 'none' OR TRIM(NEW.additionalReq) = '' THEN
        SET NEW.additionalReq = 'NONE';
    END IF;
END;
//

CREATE TRIGGER before_reservation_update
BEFORE UPDATE ON reservation_information
FOR EACH ROW
BEGIN
    SET NEW.roomType = UPPER(NEW.roomType);
    SET NEW.bedType = UPPER(NEW.bedType);
    SET NEW.smokingPref = UPPER(NEW.smokingPref);
    IF TRIM(LOWER(NEW.additionalReq)) = 'none' OR TRIM(NEW.additionalReq) = '' THEN
        SET NEW.additionalReq = 'NONE';
    END IF;    
END;
//

-- Trigger for COMPANION INFORMATION TABLE
CREATE TRIGGER before_companion_insert
BEFORE INSERT ON companion_information
FOR EACH ROW
BEGIN
    SET NEW.compSex = UPPER(NEW.compSex);
END;
//

CREATE TRIGGER before_companion_update
BEFORE UPDATE ON companion_information
FOR EACH ROW
BEGIN
    SET NEW.compSex = UPPER(NEW.compSex);
END;
//

DELIMITER ;
