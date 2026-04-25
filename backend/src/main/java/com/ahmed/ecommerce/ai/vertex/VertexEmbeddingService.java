package com.ahmed.ecommerce.ai.vertex;

import com.ahmed.ecommerce.ai.EmbeddingService;
import com.google.cloud.aiplatform.v1.EndpointName;
import com.google.cloud.aiplatform.v1.PredictResponse;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
import com.google.protobuf.Struct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Production embedding service that calls Google Vertex AI's
 * {@code multimodalembedding@001} model.
 *
 * <p>The class is only instantiated when {@code ai.provider=vertex}. When the
 * provider is mock (the default in dev/test), this bean is absent and Mock*
 * services satisfy the auto-wired interfaces.
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "ai", name = "provider", havingValue = "vertex")
public class VertexEmbeddingService implements EmbeddingService {

    private final String project;
    private final String location;
    private final String model;

    public VertexEmbeddingService(@Value("${ai.vertex.project:${GOOGLE_CLOUD_PROJECT:}}") String project,
                                   @Value("${ai.vertex.location:us-central1}") String location,
                                   @Value("${ai.vertex.embedding-model:multimodalembedding@001}") String model) {
        this.project = project;
        this.location = location;
        this.model = model;
    }

    @Override
    public double[] embedImage(byte[] imageBytes, String contentType) {
        if (project == null || project.isBlank()) {
            log.warn("ai.vertex.project not configured — returning null embedding");
            return null;
        }
        if (imageBytes == null || imageBytes.length == 0) {
            return new double[VECTOR_DIMENSIONS];
        }
        String endpoint = location + "-aiplatform.googleapis.com:443";
        PredictionServiceSettings settings;
        try {
            settings = PredictionServiceSettings.newBuilder().setEndpoint(endpoint).build();
        } catch (Exception e) {
            log.error("Failed to build Vertex client settings", e);
            return null;
        }
        try (PredictionServiceClient client = PredictionServiceClient.create(settings)) {
            EndpointName name = EndpointName.ofProjectLocationPublisherModelName(
                    project, location, "google", model);
            String b64 = Base64.getEncoder().encodeToString(imageBytes);
            Struct image = Struct.newBuilder()
                    .putFields("bytesBase64Encoded", com.google.protobuf.Value.newBuilder().setStringValue(b64).build())
                    .build();
            Struct instance = Struct.newBuilder()
                    .putFields("image", com.google.protobuf.Value.newBuilder().setStructValue(image).build())
                    .build();
            List<com.google.protobuf.Value> instances = new ArrayList<>();
            instances.add(com.google.protobuf.Value.newBuilder().setStructValue(instance).build());
            PredictResponse resp = client.predict(name, instances, com.google.protobuf.Value.newBuilder().setStructValue(Struct.getDefaultInstance()).build());
            if (resp.getPredictionsCount() == 0) {
                log.warn("Vertex embedding returned no predictions");
                return null;
            }
            Struct first = resp.getPredictions(0).getStructValue();
            com.google.protobuf.Value vec = first.getFieldsOrDefault("imageEmbedding", null);
            if (vec == null || !vec.hasListValue()) {
                log.warn("Vertex prediction missing imageEmbedding");
                return null;
            }
            List<com.google.protobuf.Value> values = vec.getListValue().getValuesList();
            double[] out = new double[VECTOR_DIMENSIONS];
            int n = Math.min(values.size(), VECTOR_DIMENSIONS);
            for (int i = 0; i < n; i++) {
                out[i] = values.get(i).getNumberValue();
            }
            return out;
        } catch (Exception e) {
            log.error("Vertex embedImage failed", e);
            return null;
        }
    }
}
