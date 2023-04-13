#pragma once
#include <GL/glew.h>
#include <glfw3.h>
#include <iostream>

class Window
{
private:
	GLFWwindow* m_mainWindow;
	GLint m_width;
	GLint m_height;
	GLint m_bufferWidth;
	GLint m_bufferHeight;
	bool m_keys[1024];

	bool    m_isLeftMouseButtonPressed{false};
	bool    m_mouseFirstMoved{false};
	GLfloat m_lastX{0.0};
	GLfloat m_lastY{0.0};
	GLfloat m_xChange{0.0};
	GLfloat m_yChange{0.0};

	void createCallbacks();
	static void handleKeys(GLFWwindow* window, int key, int code, int action, int mode);
	static void handleMouse(GLFWwindow* window, double posX, double posY);
	static void handleMouseButtons(GLFWwindow* window, int button, int action, int mods);

public:
	Window(GLint windowWidth, GLint windowHeight);
	~Window();

	int initialize();

	void swapBuffers();
	
	bool getShouldClose() const { return glfwWindowShouldClose(m_mainWindow); };
	GLfloat getXPos() const { return m_lastX; };
	GLfloat getYPos() const { return m_lastX; };
	bool getLeftMouseButtonPressed() const { return m_isLeftMouseButtonPressed; };
};

