import blogPosts from '../../src/database/BlogData.js'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function BlogThumbnails () {
    return (
        <Row xs={1} md={2} lg={3} className="g-4">
            {
                blogPosts.map((post) => (
                    <Col key={post.id}>
                        <Card>
                            <Card.Img
                                variant="top"
                                src={
                                    Array.isArray(post.image) && post.image.length > 0
                                    ? post.image[0]
                                    : (typeof post.image === 'string' && post.image.trim() !== ''
                                        ? post.image
                                        : '/placeholder.jpg')
                                }
                                alt={post.title || 'Blog image'}
                                style={{ objectFit: 'cover', height: '200px' }}
                            />
                            <Card.Body>
                                <Card.Title>{post.title}</Card.Title>
                                <Card.Text>{post.description}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))
            }
        </Row>
    )
}

export default BlogThumbnails;