package com.lodgio.lodgio.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private UUID id;

    @Column(unique = true)
    private String email;

    private String fullname;

    private String role;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "contact_numbers", length = 1000)
    private String contactNumbers;

    @Column(name = "saved_cards", length = 2000)
    private String savedCards;
}
