#include "Mesh.h"

Mesh::Mesh() : VBO(0), VAO(0), IBO(0), m_indexCount(0)
{
}

Mesh::~Mesh()
{
	clearMesh();
}

void Mesh::createMesh(GLfloat* vertices, unsigned int* indices, unsigned int nVertices, unsigned int nIndices)
{
	m_indexCount = nIndices;

	// create one vertex array and bind it
	glGenVertexArrays(1, &VAO);
	glBindVertexArray(VAO);

	// create one element buffer, bind it, and attach the data
	glGenBuffers(1, &IBO);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, IBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices[0]) * nIndices, indices, GL_STATIC_DRAW);

	// create one vertex buffer, bind it, and attach the data
	glGenBuffers(1, &VBO);
	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(vertices[0]) * nVertices * 5, vertices, GL_STATIC_DRAW);

	// position vectors (attribute 0): three coords -> stride 5, offset 0
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(vertices[0]) * 5, 0);
	glEnableVertexAttribArray(0);

	// texture coordinates (attribute 1): two coords -> stride 5, offset 3
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(vertices[0]) * 5, (void*)(3 * sizeof(GLfloat)));
	glEnableVertexAttribArray(1);

	// unbind buffers
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
}

void Mesh::renderMesh()
{
	glBindVertexArray(VAO);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, IBO);

	glDrawElements(GL_TRIANGLES, m_indexCount, GL_UNSIGNED_INT, 0);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
}

void Mesh::clearMesh()
{
	if (IBO != 0)
	{
		glDeleteBuffers(1, &IBO);
		IBO = 0;
	}

	if (VBO != 0)
	{
		glDeleteBuffers(1, &VBO);
		VBO = 0;
	}

	if (VAO != 0)
	{
		glDeleteVertexArrays(1, &VAO);
		VAO = 0;
	}
}
