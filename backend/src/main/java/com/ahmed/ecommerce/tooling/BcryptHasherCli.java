package com.ahmed.ecommerce.tooling;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Tiny CLI to compute a BCrypt hash for seed migrations. */
public class BcryptHasherCli {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: BcryptHasherCli <plaintext>");
            System.exit(1);
        }
        System.out.println(new BCryptPasswordEncoder(10).encode(args[0]));
    }
}
