package com.ahmed.ecommerce.similarity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CosineSimilarityTest {

    @Test
    void testIdentical() {
        double[] a = {1.0, 2.0, 3.0};
        double[] b = {1.0, 2.0, 3.0};
        assertThat(CosineSimilarity.cosine(a, b))
                .isCloseTo(1.0, org.assertj.core.data.Offset.offset(1e-9));
    }

    @Test
    void testOrthogonal() {
        double[] a = {1.0, 0.0};
        double[] b = {0.0, 1.0};
        assertThat(CosineSimilarity.cosine(a, b))
                .isCloseTo(0.0, org.assertj.core.data.Offset.offset(1e-9));
    }

    @Test
    void testNullOrEmpty() {
        assertThat(CosineSimilarity.cosine(null, new double[] {1.0})).isEqualTo(0.0);
        assertThat(CosineSimilarity.cosine(new double[] {1.0}, null)).isEqualTo(0.0);
        assertThat(CosineSimilarity.cosine(new double[] {}, new double[] {})).isEqualTo(0.0);
    }

    @Test
    void testDifferentLengths() {
        assertThat(CosineSimilarity.cosine(new double[] {1.0}, new double[] {1.0, 2.0}))
                .isEqualTo(0.0);
    }
}
