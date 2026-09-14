package com.suyash.job_readiness_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone; // <-- Ye naya import add karna hai

@SpringBootApplication
public class JobReadinessPlatformApplication {

	public static void main(String[] args) {
		// Application start hone se pehle timezone ko modern format mein set karna
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));

		SpringApplication.run(JobReadinessPlatformApplication.class, args);
	}
}