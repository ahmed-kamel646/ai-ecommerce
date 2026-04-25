package com.ahmed.ecommerce.user;

import com.ahmed.ecommerce.user.dto.ChangePasswordRequest;
import com.ahmed.ecommerce.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        return userService.getCurrentUser(authentication);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
                                                @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(authentication, req);
        return ResponseEntity.noContent().build();
    }
}
