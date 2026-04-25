package com.ahmed.ecommerce.ai.vertex;

import com.ahmed.ecommerce.ai.EmbeddingService;
import com.google.cloud.aiplatform.v1.EndpointName;
import com.google.cloud.aiplatform.v1.PredictResponse;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import java.util.Base64;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "vertex")
public class VertexEmbeddingService implements EmbeddingService {

    private final VertexProperties properties;

    public VertexEmbeddingService(VertexProperties properties) {
        this.properties = properties;
    }

    @Override
    public double[] embed(byte[] image) {
        try {
            PredictionServiceSettings settings =
                    PredictionServiceSettings.newBuilder()
                            .setEndpoint(
                                    properties.getLocation() + "-aiplatform.googleapis.com:443")
                            .build();

            try (PredictionServiceClient client = PredictionServiceClient.create(settings)) {
                EndpointName endpointName =
                        EndpointName.ofProjectLocationPublisherModelName(
                                properties.getProject(),
                                properties.getLocation(),
                                "google",
                                properties.getEmbeddingModel());

                Value imageBytesValue =
                        Value.newBuilder()
                                .setStringValue(Base64.getEncoder().encodeToString(image))
                                .build();

                Value imageObjValue =
                        Value.newBuilder()
                                .setStructValue(
                                        Struct.newBuilder()
                                                .putFields("bytesBase64Encoded", imageBytesValue))
                                .build();

                Value instanceValue =
                        Value.newBuilder()
                                .setStructValue(
                                        Struct.newBuilder().putFields("image", imageObjValue))
                                .build();

                PredictResponse response =
                        client.predict(
                                endpointName, List.of(instanceValue), Value.newBuilder().build());

                List<Value> listValue =
                        response.getPredictions(0)
                                .getStructValue()
                                .getFieldsOrThrow("imageEmbedding")
                                .getListValue()
                                .getValuesList();

                double[] result = new double[listValue.size()];
                for (int i = 0; i < listValue.size(); i++) {
                    result[i] = listValue.get(i).getNumberValue();
                }
                return result;
            }
        } catch (Exception e) {
            throw new RuntimeException("Vertex AI embedding failed", e);
        }
    }

    @Override
    public int dim() {
        return 1408;
    }
}
