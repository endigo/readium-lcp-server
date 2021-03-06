\connect lsdserver;

CREATE TABLE "license_status" (
    "id" serial PRIMARY KEY,
    "status" int NOT NULL,
    "license_updated" timestamp NOT NULL,
    "status_updated" timestamp NOT NULL,
    "device_count" int DEFAULT NULL,
    "potential_rights_end" timestamp DEFAULT NULL,
    "license_ref" varchar(255) NOT NULL,
    "rights_end" timestamp DEFAULT NULL
);

CREATE INDEX "license_ref_index" ON "license_status" ("license_ref");

CREATE TABLE "event" (
    "id" serial PRIMARY KEY,
    "device_name" varchar(255) DEFAULT NULL,
    "timestamp" timestamp NOT NULL,
    "type" int NOT NULL,
    "device_id" varchar(255) DEFAULT NULL,
    "license_status_fk" int NOT NULL,
    FOREIGN KEY("license_status_fk") REFERENCES "license_status" ("id")
);

CREATE INDEX "license_status_fk_index" on "event" ("license_status_fk");