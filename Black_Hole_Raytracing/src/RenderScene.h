#pragma once
#include <vector>
#include "Mesh.h"
#include "Window.h"
#include "Shader.h"
#include "Texture.h"

class RenderScene
{
private:
	std::unique_ptr<Window> m_window;
	std::vector<std::unique_ptr<Shader>> m_shaders;
	Mesh m_sceneMesh;

	static constexpr int SCREEN_WIDTH{1024};
	static constexpr int SCREEN_HEIGHT{1024};

	std::vector<float> m_data; //
	Texture m_texture; //

public:
	RenderScene();
	void render();
	bool getShouldClose();

	void renderTexture(); //
	void renderTextureCPU(); //
};

