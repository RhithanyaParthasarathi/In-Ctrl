package com.inctrl.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// Load the .env file
		// ignoreIfMissing() ensures it doesn't crash in production environments where
		// .env isn't used
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

		// Map the loaded .env variables into standard Java System Properties
		// This way, Spring Boot's application.properties can read them using
		// ${VARIABLE_NAME}
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		SpringApplication.run(BackendApplication.class, args);
	}

}
