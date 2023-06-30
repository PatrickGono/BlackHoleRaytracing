#include "RenderScene.h"

RenderScene::RenderScene()
{
	m_data = std::vector<float>(SCREEN_WIDTH * SCREEN_HEIGHT, 1.0f);
	for (int i = 0; i < m_data.size(); ++i)
	{
		m_data[i] = 1.0 / (SCREEN_WIDTH * SCREEN_HEIGHT) * (i + 1);
	}

	// set up window
	m_window = std::make_unique<Window>(SCREEN_WIDTH, SCREEN_HEIGHT);
	m_window->initialize();

	// initialize texture
	m_texture = Texture(SCREEN_WIDTH, SCREEN_HEIGHT);
	m_texture.initializeTexture();
	m_texture.useTexture();

	// create shaders
	m_shaders.emplace_back(std::make_unique<Shader>("Shaders/shader.vert", "Shaders/shader.frag"));
	m_shaders.emplace_back(std::make_unique<Shader>("Shaders/shaderTexture.vert", "Shaders/shaderTexture.frag"));

	// set up mesh for screen rectangle
	 std::vector<GLfloat> vertices = { -1.0f, -1.0f, -1.0f,    0.0f, 0.0f,
    				     			    1.0f, -1.0f, -1.0f,    1.0f, 0.0f,
    	 							   -1.0f,  1.0f, -1.0f,    0.0f, 1.0f,
    	 							    1.0f,  1.0f, -1.0f,    1.0f, 1.0f }; 

	std::vector<unsigned int> indices = { 0, 2, 1, 1, 2, 3 };
	m_sceneMesh.createMesh(vertices.data(), indices.data(), 4, indices.size());

	// set up screen size uniforms
	m_shaders[0]->useShader();
	m_shaders[0]->setFloat("screenWidth", static_cast<float>(SCREEN_WIDTH));
	m_shaders[0]->setFloat("screenHeight", static_cast<float>(SCREEN_HEIGHT));
	m_shaders[0]->setFloat("time", static_cast<float>(glfwGetTime()));
}

void RenderScene::render()
{
	glClearColor(0.1f, 0.1f, 0.15f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	m_shaders[0]->useShader();
	m_shaders[0]->setFloat("time", static_cast<float>(glfwGetTime()));
	m_sceneMesh.renderMesh();

	m_window->swapBuffers();
}

void RenderScene::renderTexture()
{
	glClearColor(0.2f, 0.2f, 0.3f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	m_shaders[1]->useShader();
	m_texture.useTexture();
	glm::mat4 ortho = glm::ortho(-1.2f, 1.2f, -1.2f, 1.2f, 0.0f, 10.0f);
	m_shaders[1]->setMat4("projection", ortho);
	renderTextureCPU();

	m_sceneMesh.renderMesh();
	m_window->swapBuffers();
}

bool RenderScene::getShouldClose()
{
	return m_window->getShouldClose();
}

void RenderScene::renderTextureCPU()
{
	size_t i = 0;
	for (auto value : m_data)
	{
		m_texture[i + 0] = (unsigned char)(1.0 * 255.0f);
		m_texture[i + 1] = (unsigned char)(value * 255.0f);
		m_texture[i + 2] = (unsigned char)(value * 255.0f);
		i += 3;
	}
	for (int i = 1000; i < 1003; i++)
	{
		std::cout << int(m_texture[i]) << " ";
	}
	std::cout << "\n";
	m_texture.setTexture();
}
