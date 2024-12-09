CREATE TABLE Dogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  gender VARCHAR(10),
  size VARCHAR(10),
  hostUid VARCHAR(36),
)

CREATE TABLE UserDogs (
  uid VARCHAR(36) PRIMARY KEY,
  dogId INT,
  userId VARCHAR(36),
  FOREIGN KEY (dogId) REFERENCES Dogs(id),
)

CREATE TABLE Diaries (
  dogId INT,
  date DATE,
  memo TEXT,
)

CREATE TABLE Items (
  id INT AUTO_INCREMENT PRIMARY KEY,
)

GRANT ALL PRIVILEGES ON PetHealth.* TO "api"@"localhost";