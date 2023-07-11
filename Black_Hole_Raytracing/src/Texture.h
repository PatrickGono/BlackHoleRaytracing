#pragma once
#include <GL/glew.h>
#include <vector>
#include <string>

class Texture
{
private:
	GLuint m_textureID{0};
	int m_width{0};
	int m_height{0};
	std::string m_textureFileName{""};

public:
	Texture();
	Texture(const std::string& textureFileName);
	~Texture();

	void initializeTexture();
	void useTexture();
	void clearTexture();
};

