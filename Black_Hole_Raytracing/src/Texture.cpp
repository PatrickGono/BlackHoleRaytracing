#include <iostream>

#define STB_IMAGE_IMPLEMENTATION
#include "Texture.h"
#include "stb_image.h"

Texture::Texture() : Texture("")
{
}

Texture::Texture(const std::string& textureFileName) : m_textureFileName(textureFileName), m_width(0), m_height(0), m_textureID(0)
{
}

Texture::~Texture()
{
	clearTexture();
}

void Texture::initializeTexture()
{
	glGenTextures(1, &m_textureID);
	glBindTexture(GL_TEXTURE_2D, m_textureID);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	int comp{0};
	unsigned char* data = stbi_load(m_textureFileName.c_str(), &m_width, &m_height, &comp, STBI_rgb);
	if (data == nullptr)
	{
		std::cout << "could not load texture: " << m_textureFileName << "\n";
		m_width = 1;
		m_height = 1;
		unsigned char placeholder[3] = {255, 0, 255};
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, m_width, m_height, 0, GL_RGB, GL_UNSIGNED_BYTE, placeholder);
	}
	else
	{
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, m_width, m_height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
		stbi_image_free(data);
	}

	glBindTexture(GL_TEXTURE_2D, 0);
}


void Texture::useTexture()
{
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, m_textureID);
}

void Texture::clearTexture()
{
	glDeleteTextures(1, &m_textureID);
	m_textureID = 0;
	m_width = 0;
	m_height = 0;
}
