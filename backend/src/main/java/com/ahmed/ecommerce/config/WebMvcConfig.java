package com.ahmed.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir}")
    private String uploadsDir;

    @Value("${app.uploads.public-base-url}")
    private String publicBaseUrl;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path absolute = Paths.get(uploadsDir).toAbsolutePath().normalize();
        registry.addResourceHandler(publicBaseUrl + "/**")
                .addResourceLocations("file:" + absolute + "/")
                .setCachePeriod(3600);
    }
}
