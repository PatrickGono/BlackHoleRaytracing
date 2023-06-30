#include "Texture.h"

Texture::Texture() : m_width(0), m_height(0), m_textureID(0), m_textureData(0)
{
	initializeTexture();
}

Texture::Texture(int width, int height) : m_width(width), m_height(height), m_textureID(0), m_textureData(0)
{
	initializeTexture();
	m_textureData = std::vector<unsigned char>(width * height * 3, 0);
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

	glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture::setTexture()
{
	glBindTexture(GL_TEXTURE_2D, m_textureID);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, m_width, m_height, 0, GL_RGB, GL_UNSIGNED_BYTE, m_textureData.data());
	glGenerateMipmap(GL_TEXTURE_2D);
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
