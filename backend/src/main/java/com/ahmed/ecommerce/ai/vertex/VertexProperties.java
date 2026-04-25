package com.ahmed.ecommerce.ai.vertex;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai.vertex")
public class VertexProperties {
    private String project;
    private String location;
    private String credentialsPath;
    private String embeddingModel = "multimodalembedding@001";
    private String textModel = "gemini-1.5-flash";
}
