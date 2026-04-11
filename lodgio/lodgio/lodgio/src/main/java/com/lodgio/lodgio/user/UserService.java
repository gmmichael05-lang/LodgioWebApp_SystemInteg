package com.lodgio.lodgio.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    /**
     * Update only the editable profile fields (fullname, mobileNumber).
     */
    public Optional<User> updateProfile(UUID id, String fullname, String mobileNumber) {
        return userRepository.findById(id).map(user -> {
            if (fullname != null) user.setFullname(fullname);
            if (mobileNumber != null) user.setMobileNumber(mobileNumber);
            return userRepository.save(user);
        });
    }

    /**
     * Update profile picture URL.
     */
    public Optional<User> updateProfilePicture(UUID id, String imageUrl) {
        return userRepository.findById(id).map(user -> {
            user.setProfilePictureUrl(imageUrl);
            return userRepository.save(user);
        });
    }
}
