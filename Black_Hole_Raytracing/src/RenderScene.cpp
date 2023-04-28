#include "RenderScene.h"

RenderScene::RenderScene()
{
	// set up window
	m_window = std::make_unique<Window>(1280, 1024);
	m_window->initialize();

	// create shaders
	m_shaders.emplace_back("Shaders/shader.vert", "Shaders/shader.frag");

	// set up mesh for screen rectangle
	std::vector<GLfloat> vertices = { -1.0f, -1.0f, 0.0f,
					     			  -1.0f,  1.0f, 0.0f,
									   1.0f,  1.0f, 0.0f,
									   1.0f, -1.0f, 0.0f };
	std::vector<unsigned int> indices = { 0, 1, 2, 0, 2, 3 };
	m_sceneMesh.createMesh(vertices.data(), indices.data(), vertices.size(), indices.size());

	// set up screen size uniforms
	m_shaders[0].useShader();
	m_shaders[0].setFloat("screenWidth", static_cast<float>(SCREEN_WIDTH));
	m_shaders[0].setFloat("screenHeight", static_cast<float>(SCREEN_HEIGHT));
	m_shaders[0].setFloat("time", static_cast<float>(glfwGetTime()));
}

void RenderScene::render()
{
	glClearColor(0.1f, 0.1f, 0.15f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	m_shaders[0].useShader();
	m_shaders[0].setFloat("time", static_cast<float>(glfwGetTime()));
	m_sceneMesh.renderMesh();

	m_window->swapBuffers();
}

bool RenderScene::getShouldClose()
{
	return m_window->getShouldClose();
}
