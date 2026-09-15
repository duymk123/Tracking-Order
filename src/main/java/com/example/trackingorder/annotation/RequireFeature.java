package com.example.trackingorder.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD}) // gắn trên method
@Retention(RetentionPolicy.RUNTIME) // tồn tại lúc runtime để AOP đọc
@Documented
public @interface RequireFeature {

//    Dùng String[] để truyền được 1 hoặc nhiều cờ (list feature)
//    @RequireFeature("BUY_NOW") hoặc @RequireFeature({"BUY_NOW", "VOUCHER"})
//    String[] value() default {};



//     @RequireFeature(flags = {"BUY_NOW"})
    String[] flags() default {};

   // bắn message lỗi
    String message() default "Tính năng đang bảo trì";

//    Trong Java Annotation, nếu đặt tên thuộc tính là value(),
//    bạn có thể viết ngắn gọn @RequireFeature("BUY_NOW") thay vì phải gõ
//    @RequireFeature(flags = {"BUY_NOW"}).

}
