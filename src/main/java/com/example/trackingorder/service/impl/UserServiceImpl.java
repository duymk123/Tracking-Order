package com.example.trackingorder.service.impl;

import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.UserAddressMapper;
import com.example.trackingorder.dto.request.CreateUserAddressReq;
import com.example.trackingorder.dto.request.RegisterReq;
import com.example.trackingorder.dto.response.UserAddressRes;
import com.example.trackingorder.dto.response.UserProfileRes;
import com.example.trackingorder.entity.Cart;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.entity.UserAddress;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.CartRepo;
import com.example.trackingorder.repository.UserAddressRepo;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.trackingorder.common.RoleEnum;
import com.example.trackingorder.common.UserStatusEnum;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthenticationFacade authenticationFacade;
    private final UserAddressRepo userAddressRepo;
    private final UserAddressMapper userAddressMapper;
    private final UserRepo userRepo;
    private final CartRepo cartRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileRes getCurrentUserProfile() {
        User user = authenticationFacade.getCurrentUser();
        return UserProfileRes.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }

    @Override
    public List<UserAddressRes> getMyAddresses() {
        User user = authenticationFacade.getCurrentUser();
        return userAddressMapper.toUserAddressResList(userAddressRepo.findByUser(user));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddressRes addAddress(CreateUserAddressReq req) {
        User user = authenticationFacade.getCurrentUser();

        // Nếu là địa chỉ mặc định, bỏ default của địa chỉ cũ
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            Optional<UserAddress> existingDefault = userAddressRepo.findByUserAndIsDefaultTrue(user);
            existingDefault.ifPresent(addr -> {
                addr.setIsDefault(false);
                userAddressRepo.save(addr);
            });
        }

        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setName(req.getName());
        address.setPhone(req.getPhone());
        address.setProvince(req.getProvince());
        address.setCity(req.getCity());
        address.setDistrict(req.getDistrict());
        address.setDetailAddress(req.getDetailAddress());
        address.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));

        address = userAddressRepo.save(address);
        return userAddressMapper.toUserAddressRes(address);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAddress(String addressId) {
        User user = authenticationFacade.getCurrentUser();
        UserAddress address = userAddressRepo.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Address not found"));
        userAddressRepo.delete(address);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddressRes setDefaultAddress(String addressId) {
        User user = authenticationFacade.getCurrentUser();

        // Bỏ default của địa chỉ cũ
        userAddressRepo.findByUserAndIsDefaultTrue(user).ifPresent(addr -> {
            addr.setIsDefault(false);
            userAddressRepo.save(addr);
        });

        // Set default cho địa chỉ mới
        UserAddress address = userAddressRepo.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Address not found"));
        address.setIsDefault(true);
        address = userAddressRepo.save(address);
        return userAddressMapper.toUserAddressRes(address);
    }
    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserProfileRes register(RegisterReq req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setStatus(UserStatusEnum.ACTIVE);

        try {
            user.setRole(RoleEnum.valueOf(req.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(HttpStatus.BAD_REQUEST, "Invalid role");
        }

        user = userRepo.save(user);

        if (user.getRole() == RoleEnum.BUYER) {
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepo.save(cart);
        }

        return UserProfileRes.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }
}
