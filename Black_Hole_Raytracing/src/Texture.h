#pragma once
#include <GL/glew.h>
#include <vector>

class Texture
{
private:
	GLuint m_textureID;
	int m_width{0};
	int m_height{0};
	std::vector<unsigned char> m_textureData;

public:
	Texture();
	Texture(int width, int height);
	~Texture();

	void initializeTexture();
	void setTexture();
	void useTexture();
	void clearTexture();
};

