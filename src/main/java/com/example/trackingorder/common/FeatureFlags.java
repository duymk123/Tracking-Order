package com.example.trackingorder.common;

import jdk.jfr.Label;
import org.togglz.core.Feature;
import org.togglz.core.annotation.ActivationParameter;
import org.togglz.core.annotation.DefaultActivationStrategy;
import org.togglz.core.annotation.EnabledByDefault;

public enum FeatureFlags implements Feature {
    @Label("Buy Now")
    @DefaultActivationStrategy(id = "user-role", parameters = {
            @ActivationParameter(name = "roles", value = "ROLE_BUYER")
    })
    BUY_NOW,

    @Label("Price Increase")
    PRICE_INCREASE,

    @Label("OrderDetail")
    @EnabledByDefault    // Default là bật
    ORDER_DETAIL;

}
