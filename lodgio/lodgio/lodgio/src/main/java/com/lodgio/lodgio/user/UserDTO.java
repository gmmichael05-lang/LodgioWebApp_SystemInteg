package com.lodgio.lodgio.user;

import java.util.UUID;

public record UserDTO(
        UUID id,
        String email,
        String fullname,
        String role,
        String mobileNumber,
        String profilePictureUrl,
        String contactNumbers,
        String savedCards
) {
    public static UserDTO from(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullname(),
                user.getRole(),
                user.getMobileNumber(),
                user.getProfilePictureUrl(),
                user.getContactNumbers(),
                user.getSavedCards()
        );
    }
}
