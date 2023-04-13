#include "Shader.h"

Shader::Shader(const char* vertexShaderPath, const char* fragmentShaderPath)
{
	m_programId = glCreateProgram();

	addShader(m_programId, vertexShaderPath, GL_VERTEX_SHADER);
	addShader(m_programId, fragmentShaderPath, GL_FRAGMENT_SHADER);

	glLinkProgram(m_programId);

	int success{0};
	char errorMessage[512]{};
	glGetProgramiv(m_programId, GL_LINK_STATUS, &success);
	if (!success)
	{
		glGetProgramInfoLog(m_programId, 512, nullptr, errorMessage);
		std::cout << "Error linking shader program:\n" << errorMessage << "\n";
	}
}

Shader::~Shader()
{
	if (m_programId != 0)
	{
		glDeleteProgram(m_programId);
		m_programId = 0;
	}
}

void Shader::useShader()
{
	glUseProgram(m_programId);
}

std::string Shader::readShaderFile(const char* filePath)
{
	std::string code{""};
	std::ifstream shaderFile(filePath, std::ios::in);

	if (!shaderFile)
	{
		std::cout << "Failed to open shader file: " << filePath << "\n";
		return code;
	}

	std::string line = "";
	while (std::getline(shaderFile, line))
	{
		code.append(line + "\n");
	}

	shaderFile.close();
	return code;
}

void Shader::addShader(unsigned int program, const char* shaderPath, GLenum shaderType)
{
	std::string shaderString = readShaderFile(shaderPath);

	const GLchar* code[1]{};
	code[0] = shaderString.c_str();

	GLint codeLength[1]{};
	codeLength[0] = strlen(shaderString.c_str());

	unsigned int shaderId{};

	shaderId = glCreateShader(shaderType);
	glShaderSource(shaderId, 1, code, codeLength);
	glCompileShader(shaderId);

	int success{0};
	char errorMessage[512]{};
	glGetShaderiv(shaderId, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(shaderId, 512, nullptr, errorMessage);
		std::cout << "Error compiling shader " << shaderPath << ":\n" << errorMessage << "\n";
	}

	glAttachShader(program, shaderId);
}

void Shader::setBool(const std::string& name, bool value) const
{
	glUniform1i(glGetUniformLocation(m_programId, name.c_str()), static_cast<int>(value));
}

void Shader::setInt(const std::string& name, int value) const
{
	glUniform1i(glGetUniformLocation(m_programId, name.c_str()), value);
}

void Shader::setFloat(const std::string& name, float value) const
{
	glUniform1f(glGetUniformLocation(m_programId, name.c_str()), value);
}

void Shader::setVec3(const std::string& name, float x, float y, float z) const
{
	glUniform3f(glGetUniformLocation(m_programId, name.c_str()), x, y, z);
}

void Shader::setMat4(const std::string& name, glm::mat4 matrix) const
{
	glUniformMatrix4fv(glGetUniformLocation(m_programId, name.c_str()), 1, GL_FALSE, glm::value_ptr(matrix));
}


