package com.ordermanagement.domain.enums;

/**
 * user roles for authorization - defines what each user can do in the system
 */
public enum UserRole {
    ADMIN,      // full access, can manage everything
    MANAGER,    // can manage products, orders, but not users
    CUSTOMER    // regular customer, can only place orders and view their stuff
}
