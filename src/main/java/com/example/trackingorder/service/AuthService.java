package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.LoginReq;
import com.example.trackingorder.dto.request.RefreshTokenReq;
import com.example.trackingorder.dto.response.AuthRes;

public interface AuthService {


//     Đăng nhập người dùng bằng username và password.
//     Trả về JWT Access Token (5 phút), Refresh Token, User Profile và Feature Snapshot map.
    AuthRes login(LoginReq req);


//     Làm mới Access Token bằng Refresh Token.
//     Trả về Access Token mới cùng Feature Snapshot mới nhất.
    AuthRes refresh(RefreshTokenReq req);

//  Lấy thông tin user hiện tại và Feature Snapshot tương ứng.
    AuthRes getMe();
}
