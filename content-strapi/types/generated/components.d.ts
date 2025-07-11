import type { Schema, Struct } from '@strapi/strapi';

export interface ContactAddress extends Struct.ComponentSchema {
  collectionName: 'components_contact_addresses';
  info: {
    displayName: 'Address';
  };
  attributes: {
    city: Schema.Attribute.String & Schema.Attribute.Required;
    country: Schema.Attribute.String & Schema.Attribute.Required;
    number: Schema.Attribute.String;
    street: Schema.Attribute.String;
    zip_code: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactContactData extends Struct.ComponentSchema {
  collectionName: 'components_contact_contact_data';
  info: {
    description: '';
    displayName: 'Contact Data';
  };
  attributes: {
    address: Schema.Attribute.Component<'contact.address', false>;
    email_address: Schema.Attribute.Email;
    first_name: Schema.Attribute.String;
    last_name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
  };
}

export interface ContactOpeningHours extends Struct.ComponentSchema {
  collectionName: 'components_contact_opening_hours';
  info: {
    displayName: 'Opening Hours';
  };
  attributes: {
    close: Schema.Attribute.Time & Schema.Attribute.Required;
    day: Schema.Attribute.Enumeration<
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
    > &
      Schema.Attribute.Required;
    open: Schema.Attribute.Time & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'contact.address': ContactAddress;
      'contact.contact-data': ContactContactData;
      'contact.opening-hours': ContactOpeningHours;
    }
  }
}
