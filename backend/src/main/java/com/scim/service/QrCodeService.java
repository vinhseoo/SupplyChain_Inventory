package com.scim.service;

public interface QrCodeService {
    byte[] generateQrCode(String text, int width, int height);
}
