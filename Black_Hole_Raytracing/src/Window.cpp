#include "Window.h"

void Window::createCallbacks()
{
	glfwSetInputMode(m_mainWindow, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
	glfwSetKeyCallback(m_mainWindow, handleKeys);
	glfwSetCursorPosCallback(m_mainWindow, handleMouse);
	glfwSetMouseButtonCallback(m_mainWindow, handleMouseButtons);
}

void Window::handleKeys(GLFWwindow* window, int key, int code, int action, int mode)
{
	Window* theWindow = static_cast<Window*>(glfwGetWindowUserPointer(window));

	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
	{
		glfwSetWindowShouldClose(window, GL_TRUE);
	}

	if (key >= 0 && key < 1024)
	{
		if (action == GLFW_PRESS)
		{
			theWindow->m_keys[key] == true;
		}

		if (action == GLFW_RELEASE)
		{
			theWindow->m_keys[key] == false;
		}
	}
}

void Window::handleMouse(GLFWwindow* window, double posX, double posY)
{
	Window* theWindow = static_cast<Window*>(glfwGetWindowUserPointer(window));

	theWindow->m_lastX = posX;
	theWindow->m_lastY = posY;
}

void Window::handleMouseButtons(GLFWwindow* window, int button, int action, int mods)
{
	Window* theWindow = static_cast<Window*>(glfwGetWindowUserPointer(window));

	if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_PRESS)
	{
		theWindow->m_isLeftMouseButtonPressed = true;
		theWindow->m_mouseFirstMoved = true;
	}

	if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_RELEASE)
	{
		theWindow->m_isLeftMouseButtonPressed = false;
	}
}

Window::Window(GLint windowWidth, GLint windowHeight) : m_width(windowWidth), m_height(windowHeight), m_mainWindow(nullptr), m_bufferWidth(0), m_bufferHeight(0)
{
	for (int i = 0; i < 1024; i++)
	{
		m_keys[i] = false;
	}
}

Window::~Window()
{
	glfwDestroyWindow(m_mainWindow);
	glfwTerminate();
}

int Window::initialize()
{
	if (!glfwInit())
	{
		std::cout << "GLFW initialization failed\n";
		glfwTerminate();
		return 0;
	}

	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

	m_mainWindow = glfwCreateWindow(m_width, m_height, "Black Hole Raytracing", nullptr, nullptr);
	if (!m_mainWindow)
	{
		std::cout << "GLFW window creation failed\n";
		glfwTerminate();
		return 0;
	}

	glfwGetFramebufferSize(m_mainWindow, &m_bufferWidth, &m_bufferHeight);
	glfwMakeContextCurrent(m_mainWindow);

	glewExperimental = GL_TRUE;

	if (glewInit() != GLEW_OK)
	{
		std::cout << "GLEW initialization failed\n";
		glfwDestroyWindow(m_mainWindow);
		glfwTerminate();
		return 0;
	}
	createCallbacks();

	glEnable(GL_DEPTH_TEST);

	glViewport(0, 0, m_bufferWidth, m_bufferHeight);
	glfwSetWindowUserPointer(m_mainWindow, this);
	return 1;
}

void Window::swapBuffers()
{
	glfwSwapBuffers(m_mainWindow);
}
