#pragma once
#include <iostream>
#include <GL/glew.h>

class Mesh
{
private:
	GLuint VAO, VBO, IBO;
	GLsizei m_indexCount;

public:
	Mesh();
	~Mesh();

	void createMesh(GLfloat* vertices, unsigned int* indices, unsigned int nVertices, unsigned int nIndices);
	void renderMesh();
	void clearMesh();
};

