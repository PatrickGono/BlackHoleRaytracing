// BlackHole.cpp : This file contains the 'main' function. Program execution begins and ends there.
//
#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include "FPSCounter.h"
#include "RenderScene.h"

int main(int argc, char* argv[])
{
	RenderScene renderScene{};
	FPSCounter countFPS(3.0);
	while (!renderScene.getShouldClose())
	{
		glfwPollEvents();
		countFPS.countFPS();
		renderScene.render();
	}
	return 0;
}
