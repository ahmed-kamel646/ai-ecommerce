package com.ahmed.ecommerce.user;

import com.ahmed.ecommerce.common.BusinessException;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.user.dto.ChangePasswordRequest;
import com.ahmed.ecommerce.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto getCurrentUser(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return new UserDto(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordEncoder.matches(req.oldPassword(), user.getPasswordHash())) {
            throw new BusinessException("Wrong password");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }
}
