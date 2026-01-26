export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: Address;
}
