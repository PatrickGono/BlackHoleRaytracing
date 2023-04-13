#pragma once
#include <vector>
#include "Mesh.h"
#include "Window.h"
#include "Shader.h"

class RenderScene
{
private:
	std::unique_ptr<Window> m_window;
	std::vector<Shader> m_shaders;
	Mesh m_sceneMesh;

	GLuint m_screenWidthUniform{0};
	GLuint m_screenHeightUniform{0};

	static constexpr int SCREEN_WIDTH{1280};
	static constexpr int SCREEN_HEIGHT{1024};

public:
	RenderScene();
	void render();
};

