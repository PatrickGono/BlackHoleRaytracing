#version 330 core
out vec4 fragColor;

uniform float screenWidth;
uniform float screenHeight;

vec3 getRayDirection()
{
	float relX = 2.0f * (gl_FragCoord.x / screenWidth - 0.5f);
	float relY = 2.0f * (gl_FragCoord.y / screenWidth - 0.5f);
	float fovFactor = 0.8f;
	return normalize(vec3(fovFactor * relX, fovFactor * relY, 1.0f));
}

struct Intersection
{
	bool isIntersect;
	float dist;
	vec3 intersection;
	vec3 normal;
};

Intersection intersectSphere(vec3 sphereCenter, float sphereRadius, vec3 rayOrigin, vec3 rayDirection)
{
	Intersection result = Intersection(false, 0.0f, vec3(0.0f), vec3(0.0f));

	vec3 sphereCenterToOrigin = rayOrigin - sphereCenter;
	float product = dot(rayDirection, sphereCenterToOrigin);
	float discriminant = dot(product, product) - (dot(sphereCenterToOrigin, sphereCenterToOrigin) - sphereRadius * sphereRadius);
	if (discriminant < 0.0f)
	{
		return result;
	}

	float dist = -product - sqrt(discriminant);
	result.isIntersect = true;
	result.dist = dist;
	result.intersection = rayOrigin + dist * rayDirection;
	result.normal = normalize(result.intersection - sphereCenter);
	return result;
}

vec3 traceRay(vec3 rayOrigin, vec3 rayDirection)
{
	return vec3(0.0f);
}

void main()
{
	vec3 rayDirection = getRayDirection();
	vec3 sphereCenter = vec3(0.0f, 0.0f, 5.0f);
	float radius = 3.0f;
	Intersection intersection = intersectSphere(sphereCenter, radius, vec3(0.0f, 0.0f, 0.0f), rayDirection);
	if (!intersection.isIntersect)
	{
		fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
		return;
	}

	fragColor = vec4(1.0f - intersection.dist * intersection.dist / 25.0f, 0.0f, 0.0f, 1.0f);
}
