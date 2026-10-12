# ADR 001: Property Data Contract

## Status

In progress

## Context

The neighborhood listing platform needs consistent property and sponsor data before information is displayed in the user interface. The application will use a strict data contract to prevent incomplete, malformed, or unexpected information from reaching the property components.

## Minimum Information Requirements

### Property Card

A property card needs enough information to give a user a quick summary of a listing:

- `property_id`: A unique identifier for the property.
- `address`: The street address of the property.
- `city`: The city where the property is located.
- `state`: The two-letter state abbreviation.
- `zip_code`: The five-digit ZIP code.
- `price`: The listed sale price in US dollars.
- `bedrooms`: The number of bedrooms.
- `bathrooms`: The number of bathrooms.
- `square_feet`: The interior size of the property.
- `image_url`: An image representing the property.

### Property Detail Page

A property detail page needs all property-card information plus:

- `description`: A more complete explanation of the property.
- `amenities`: A list of features such as a garage, backyard, or swimming pool.
- `property_type`: The type of property, such as a house, condominium, or townhouse.
- `listing_status`: Whether the property is available, pending, or sold.
- `local_sponsors`: References connecting the property to relevant local sponsors.

### Sponsor Selection

Sponsor selection needs:

- `sponsor_id`: A unique identifier for the sponsor.
- `name`: The sponsor's business name.
- `category`: The type of service the sponsor provides.
- `website_url`: The sponsor's website.
- `phone`: The sponsor's public business phone number.
- `service_area_zip_codes`: The ZIP codes served by the sponsor.

### Voice Response

A voice response needs:

- `response_id`: A unique identifier for the response.
- `spoken_text`: The text that the application may read aloud.
- `property_ids`: The properties referenced by the response.
- `sponsor_ids`: The sponsors referenced by the response.
- `generated_at`: The date and time the response was generated.

The voice response must only use validated property and sponsor records. It must not invent property details or private personal information.

## Data Concepts and Relationships

### Property

A Property represents one real-estate listing.

**Primary key:** `property_id`

The `property_id` must be unique so the application can distinguish one property from every other property.

Property information includes:

- Address fields
- ZIP code
- Price
- Bedrooms
- Bathrooms
- Square footage
- Description
- Property type
- Listing status
- Image URL
- Amenities

### Sponsor

A Sponsor represents one local business that may appear with a property.

**Primary key:** `sponsor_id`

The `sponsor_id` must be unique so the application can distinguish one sponsor from every other sponsor.

Sponsor information includes:

- Business name
- Business category
- Website URL
- Public business phone number
- Service-area ZIP codes

### PropertySponsor

A PropertySponsor is a join record connecting one Property to one Sponsor.

**Combined primary key:** `property_id` and `sponsor_id`

PropertySponsor information includes:

- `property_id`: Identifies the related Property.
- `sponsor_id`: Identifies the related Sponsor.
- `placement`: Identifies where the sponsor should appear.
- `is_featured`: Identifies whether the sponsor receives featured placement.

The combination of `property_id` and `sponsor_id` must be unique. This prevents the same sponsor from being connected to the same property more than once.

### Relationships

- One Property can have zero or more PropertySponsor records.
- One Sponsor can have zero or more PropertySponsor records.
- Each PropertySponsor record connects exactly one Property to exactly one Sponsor.
- Therefore, Property and Sponsor have a many-to-many relationship.
- In generated property JSON, `local_sponsors` will contain sponsor relationships associated with that property.

## Decision

To be completed during Lab 3.

## Alternatives Considered

To be completed during Lab 3.

## Consequences

To be completed during Lab 3.