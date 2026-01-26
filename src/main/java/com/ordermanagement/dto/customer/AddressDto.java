package com.ordermanagement.dto.customer;

import com.ordermanagement.domain.entity.Address;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {

    @Size(max = 200, message = "street cannot exceed 200 characters")
    private String street;

    @Size(max = 10, message = "number cannot exceed 10 characters")
    private String number;

    @Size(max = 100, message = "complement cannot exceed 100 characters")
    private String complement;

    @Size(max = 100, message = "neighborhood cannot exceed 100 characters")
    private String neighborhood;

    @Size(max = 100, message = "city cannot exceed 100 characters")
    private String city;

    @Size(max = 2, message = "state must be 2 characters")
    private String state;

    @Size(max = 9, message = "zip code cannot exceed 9 characters")
    private String zipCode;

    public static AddressDto fromEntity(Address address) {
        if (address == null) return null;

        return AddressDto.builder()
                .street(address.getStreet())
                .number(address.getNumber())
                .complement(address.getComplement())
                .neighborhood(address.getNeighborhood())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .build();
    }

    public Address toEntity() {
        return Address.builder()
                .street(this.street)
                .number(this.number)
                .complement(this.complement)
                .neighborhood(this.neighborhood)
                .city(this.city)
                .state(this.state)
                .zipCode(this.zipCode)
                .build();
    }
}
