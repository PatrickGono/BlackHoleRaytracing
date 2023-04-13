#pragma once
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <GLM/glm.hpp>
#include <GLM/gtc/type_ptr.hpp>

class Shader
{
public:
	unsigned int getProgramId();
	Shader(const char* vertexShaderPath, const char* fragmentShaderPath);
	~Shader();

	void useShader();

	void setBool(const std::string& name, bool value) const;
	void setInt(const std::string& name, int value) const;
	void setFloat(const std::string& name, float value) const;
	void setVec3(const std::string& name, float x, float y, float z) const;
	void setMat4(const std::string& name, glm::mat4 matrix) const;


private:
	unsigned int m_programId{0};
	std::string readShaderFile(const char* filePath);
	void addShader(unsigned int program, const char* shaderPath, GLenum shaderType);

};

