package com.ahmed.ecommerce.storage;

import com.ahmed.ecommerce.common.BusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalStorageServiceTest {

    @TempDir Path tempDir;
    LocalStorageService service;

    @BeforeEach
    void init() throws IOException {
        service = new LocalStorageService(tempDir.toString());
        service.init();
    }

    @AfterEach
    void cleanup() {}

    @Test
    void rejectsTooLarge() {
        byte[] big = new byte[(int) (LocalStorageService.MAX_BYTES + 1)];
        MockMultipartFile mp = new MockMultipartFile("f", "big.png", "image/png", big);
        assertThatThrownBy(() -> service.save(mp)).isInstanceOf(BusinessException.class);
    }

    @Test
    void rejectsBadContentType() {
        MockMultipartFile mp = new MockMultipartFile("f", "evil.exe", "application/octet-stream", new byte[]{1});
        assertThatThrownBy(() -> service.save(mp)).isInstanceOf(BusinessException.class);
    }

    @Test
    void rejectsTraversalExtension() {
        MockMultipartFile mp = new MockMultipartFile("f", "../../../etc/passwd.png", "image/png", new byte[]{1, 2});
        // The filename is sanitised by UUID + extOf, so this is accepted but lands inside root.
        StorageService.StoredImage stored = service.save(mp);
        assertThat(stored.url()).startsWith("/files/products/");
        assertThat(stored.url()).doesNotContain("..");
    }

    @Test
    void writesFileInsideRoot() {
        MockMultipartFile mp = new MockMultipartFile("f", "ok.png", "image/png", new byte[]{1, 2, 3});
        StorageService.StoredImage stored = service.save(mp);
        Path written = tempDir.resolve("products").resolve(stored.url().substring("/files/products/".length()));
        assertThat(Files.exists(written)).isTrue();
    }
}
