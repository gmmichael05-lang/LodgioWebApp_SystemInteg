package com.lodgio.lodgio.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody User user) {
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(UserDTO.from(saved));
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable("email") String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(UserDTO.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile-picture")
    public ResponseEntity<UserDTO> updateProfilePicture(
            @PathVariable("id") UUID id,
            @RequestBody String imageUrl) {
        String cleanUrl = imageUrl.replace("\"", "");
        return userService.updateProfilePicture(id, cleanUrl)
                .map(user -> ResponseEntity.ok(UserDTO.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable("id") UUID id,
            @RequestBody User updatedUser) {
        return userService.updateProfile(id, updatedUser.getFullname(), updatedUser.getMobileNumber())
                .map(user -> ResponseEntity.ok(UserDTO.from(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> dtos = userService.getAllUsers().stream()
                .map(UserDTO::from)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") UUID id) {
        if (userService.getUserById(id).isPresent()) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
